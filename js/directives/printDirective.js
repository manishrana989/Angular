/**
 * Created by user on 29/09/2016.
 */

function printListDirective() {
    // var template = "views/testPrint.html";
    var template = "views/common/printList.html";

    var controller = function ($scope, LeaderMESservice, AuthService, $state, $log, $modal, $timeout) {
        $scope.rtl = LeaderMESservice.isLanguageRTL();
        $scope.staticDateNow = new Date();
        $scope.widgets = [];
        $scope.options = {
            cellHeight: '1px',
            verticalMargin: 1,
            float: true,
            disableDrag: true,
            disableResize: true,
            resizable: {
                handles: 'e, se, s, sw, w'
            }
        };

        $scope.getNumArray = function (num) {
            return new Array(num);
        };

        $scope.arrayOfDates = ['datenow','datetimenow','timenow'];
        $scope.draweLine = function () {

            // $timeout(function () {

            // $scope.lineSeprator = new Array(Math.floor(parseInt($(".modal-content").css('height').replace(/px/, "")) / $scope.widgetwidth));},2000);
            // $scope.lineSeprator =[];
            //     $scope.lineSeprator.length=4;
            //     $scope.lineSepratorHeader=$scope.lineSeprator;
            // $scope.lineSepratorHeader.length+=1;
            $timeout(function () {
                if($scope.widgetheight)
                $scope.lineSeprator = new Array((Math.ceil(($("#section-to-print1").height() / $scope.widgetheight))));

                $scope.minwidthp = $("#section-to-print1").css('width');
            }, 500);
        };

        $scope.draweLine();
        // $scope.tempjson={"0":1,"1":2,"2":"2037-01-11T14:49:29","3":3,"4":4,"5":"2036-12-31T13:13:29","6":4};

        // ={"1":"1","2":"2","3":"3","4":"4","5":"5","6":"6","7":"7"};
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1; //January is 0!

        var yyyy = today.getFullYear();
        if (dd < 10) {
            dd = '0' + dd;
        }
        if (mm < 10) {
            mm = '0' + mm;
        }
        $scope.dateNow = dd + '/' + mm + '/' + yyyy;

        $scope.buildBarcode = function (index, w) {
            $timeout(function () {
                JsBarcode(".barcode" + index, w.barcode.text, {
                    fontSize: w.barcode.fontSize,
                    format: w.barcode.format,
                    lineColor: w.barcode.lineColor,
                    width: w.barcode.width,
                    height: w.barcode.height,
                    displayValue: w.barcode.displayvalue,
                    textAlign: w.barcode.textalign,
                    textPosition: w.barcode.textposition,
                    font: w.barcode.font,
                    textMargin: w.barcode.textmargin,
                    background: w.barcode.background,
                    // fontOptions: printModalCtrl.barcode.fontoptions

                })

            });

        }

        //     if ($scope.widgets && $scope.widgets.length)
        //     {
        //
        //         for (var i = 0; i < $scope.widgets.length; i++) {
        //             $scope.buildBarcode(i, $scope.widgets[i]);
        //         }
        //
        // }

        $scope.closePrintPreview = function () {
            $scope.close();

        }
        $scope.hideWidgets = function () {
            $scope.isvisible = true;
        };
        $scope.printIconHidden = false;
        // $scope.printIconHidden = true;
        $scope.printWidget = function (divName) {
            // $scope.hideWidgets();

            $scope.printIconHidden = true;
            $timeout(function () {
                window.print();
                $scope.printIconHidden = false;


            }, 1000);
        };

        $scope.buildPrintDataArray = function (printData) {
            var array = [];
            for (var i in printData) {
                var lowerCase = i.toLowerCase();
                if (lowerCase == 'file' || lowerCase == 'image' || lowerCase == 'diagram') {
                    array.push({"type": i, 'files': printData[i]});
                }
                else {
                    array.push({"DataSource": i, "Fields": printData[i]});
                }
            }
            return array;

        }
        var capitalizeFirstLetter = function (string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        };

        $scope.addValuesToStructureWeb = function (structureWeb, printData) {
            printData = $scope.buildPrintDataArray(printData);
            var printDataCopy= angular.copy(printData);
            for (var i = 0; i < structureWeb.length; i++) {
                if (structureWeb[i].typeContent == 'table') {
                    if (structureWeb[i].currentTable) {
                        var index = _.findIndex(printDataCopy, {"DataSource": structureWeb[i].currentTable});
                        if (index !== -1 && printDataCopy[index] != null && printDataCopy[index].Fields != null && printDataCopy[index].Fields && printDataCopy[index].Fields.length >= 0) {
                            // structureWeb[i].totalHeight = (printData[index].Fields.length + 1) * structureWeb[i].height;
                            // if (printData[index].Fields.length > 0 && printData[index].Fields[0].length > structureWeb[i].numberOfRowsValues) {
                            //     printData[index].Fields[0] = printData[index].Fields[0].slice(structureWeb[i].startFromRowValues, structureWeb[i].numberOfRowsValues);
                            // }
                            if (printData[index].Fields.length > 0) {
                                if (printData[index].Fields[0]) {
                                    // && (printData[index].Fields[0].length-structureWeb[i].startFromRowValues) > structureWeb[i].numberOfRowsValues) {
                                  if(structureWeb[i].startFromRowValues==0)
                                      structureWeb[i].startFromRowValues=1;
                                    if (structureWeb[i].startFromRowValues > 0) {
                                        printData[index].Fields[0] = printDataCopy[index].Fields[0].slice(structureWeb[i].startFromRowValues - 1, structureWeb[i].numberOfRowsValues + structureWeb[i].startFromRowValues-1);
                                    }
                                    else {
                                        printData[index].Fields[0] = printDataCopy[index].Fields[0].slice(0, structureWeb[i].numberOfRowsValues);

                                    }
                                }
                            }

                            // structureWeb[i].values = printData[index].Fields[0];
                            structureWeb[i].values = _.map(printData[index].Fields[0], function (r) {
                                var str = [];
                                if (structureWeb[i].typeContent == 'table' && structureWeb[i].currentFields) {
                                    for (var c = 0; c < structureWeb[i].currentFields.length; c++) {
                                        /** TODO change lowercase*/
                                        var currentValue = r[structureWeb[i].currentFields[c].Name];
                                        if (!currentValue) {
                                            str.push(r[structureWeb[i].currentFields[c].Name.toLowerCase()]);
                                        }
                                        else {
                                            str.push(currentValue);
                                        }
                                    }
                                    console.log("table");
                                    console.log(str);
                                }
                                // structureWeb[i].totalHeight = (printData[index].Fields[0].length + 1) * structureWeb[i].height;

                                return str;
                            });
                            console.log("before table");
                            console.log(structureWeb[i].values);
                            console.log("after table");
                            structureWeb[i].totalHeight = structureWeb[i].height;
                        }
                    }

                }
                else if (structureWeb[i].typeContent == 'dynamicfield' && (structureWeb[i].style == 'vertical' || structureWeb[i].style == 'horizonal' )) {
                    var currentTable = _.find(printData, {"DataSource": structureWeb[i].LabelTable});
                    if (currentTable) {
                        for (var f = 0; f < currentTable.Fields.length; f++) {
                            for (var g = 0; g < currentTable.Fields[f].length; g++) {
                                for (var h in currentTable.Fields[f][g]) {
                                    if (structureWeb[i].LabelTableField.Name.toLowerCase() == h.toLowerCase()) {
                                        structureWeb[i].value = currentTable.Fields[f][g][h];
                                    }
                                }

                            }

                        }
                    }
                    structureWeb[i].totalHeight = structureWeb[i].height;
                }
                else if (structureWeb[i].typeContent == 'staticfield' && structureWeb[i].staticContent == 'text') {
                    structureWeb[i].totalHeight = structureWeb[i].height;
                }
                else if (structureWeb[i].typeContent == 'staticfield' && (structureWeb[i].staticContent == 'file' || structureWeb[i].staticContent == 'image' || structureWeb[i].staticContent == 'diagram'  )) {
                    var files = _.find(printData, {"type": structureWeb[i].staticContent});
                    if (!files) {
                        var capitalFirstLetter = capitalizeFirstLetter(structureWeb[i].staticContent);
                        files = _.find(printData, {"type": capitalFirstLetter});
                    }
                    if (files) {
                        if (structureWeb[i].staticContent == 'file') {
                            if (files.files) {
                                for (var j = 0; j < files.files.length; j++) {
                                    var specificfile = _.find(files.files[j], {"id": structureWeb[i].currentFileID});
                                    if (specificfile) {
                                        structureWeb[i].filepath = specificfile.filepath;
                                        break;
                                    }
                                }
                            }
                        }
                        else {
                            if (files.files) {
                                for (var j = 0; j < files.files.length; j++) {
                                    var image;
                                    if (structureWeb[i].currentImageDiagramType && structureWeb[i].currentImageDiagramType.SourceObjectType) {
                                        image = _.find(files.files[j], {"ObjectTypeID": structureWeb[i].currentImageDiagramType.SourceObjectType});
                                    }
                                    else {
                                        if (structureWeb[i].currentImageDiagramType) {
                                            image = _.find(files.files[j], {"ObjectTypeID": structureWeb[i].TargetObjectType});
                                        }
                                    }
                                    if (image) {
                                        structureWeb[i].filepath = image.FilePath;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    structureWeb[i].totalHeight = structureWeb[i].height;
                }
                else if (structureWeb[i].typeContent == 'barcode' || structureWeb[i].typeContent == 'qrcode') {
                    if (structureWeb[i].barcodeType == 'dynamicfield' || structureWeb[i].qrcodeType == 'dynamicfield') {
                        if (structureWeb[i].currentTable) {
                            var index = _.findIndex(printData, {"DataSource": structureWeb[i].currentTable});
                            if (index !== -1 && printData[index].Fields) {
                                structureWeb[i].totalHeight = structureWeb[i].height;
                                var fieldName = structureWeb[i].currentFields.Name;
                                var currentText = printData[index].Fields[0][0][fieldName];
                                if (!currentText) {
                                    currentText = printData[index].Fields[0][0][fieldName.toLowerCase()];
                                }
                                structureWeb[i].text = currentText;

                                // structureWeb[i].text = _.find(printData[index].Fields,{""});

                            }
                        }
                    }
                    structureWeb[i].totalHeight = structureWeb[i].height;
                }


            }
            return structureWeb;
        }
        function sortByPosition(a, b) {
            //sort by x, secondary by y
            // if(a.y == b.y)
            //     return a.x - b.x;
            // else if(a.y<b.y)
            //     return  a.y - b.y;
            // else if(a.y>b.y)
            //     return a.y-b.y;
            return a.y == b.y ? a.x - b.x : a.y - b.y;

        };

        // $scope.getLabelStructure = function () {
        //     var data = {"ObjectID": 1000, "LabelObjectRelatedID": 106};
        //     LeaderMESservice.GetLabelStructure(data).then(function (response) {
        //     });
        // }


        $scope.orderWidgets = function (widgets) {
            var orderedWidgetsByCoordinator = widgets.sort(sortByPosition);
            var xy = [];
            for (var i = 0; i < orderedWidgetsByCoordinator.length; i++) {
                orderedWidgetsByCoordinator[i].x2 = orderedWidgetsByCoordinator[i].x + orderedWidgetsByCoordinator[i].width;

                if (!orderedWidgetsByCoordinator[i].totalHeight) {
                    orderedWidgetsByCoordinator[i].totalHeight = orderedWidgetsByCoordinator[i].height;
                }
                orderedWidgetsByCoordinator[i].y2 = orderedWidgetsByCoordinator[i].y + orderedWidgetsByCoordinator[i].totalHeight;

                for (var j = 0; j < xy.length; j++) {
                    if (((orderedWidgetsByCoordinator[i].x > xy[j].x && orderedWidgetsByCoordinator[i].x < xy[j].x2) || (orderedWidgetsByCoordinator[i].x < xy[j].x2 && orderedWidgetsByCoordinator[i].x2 > xy[j].x))
                        && ((orderedWidgetsByCoordinator[i].y < xy[j].y || orderedWidgetsByCoordinator[i].y2 < xy[j].y || orderedWidgetsByCoordinator[i].y < xy[j].y2 || orderedWidgetsByCoordinator[i].y2 < xy[j].y2 ))) {
                        orderedWidgetsByCoordinator[i].y = xy[j].y2;
                        orderedWidgetsByCoordinator[i].y2 = orderedWidgetsByCoordinator[i].y + orderedWidgetsByCoordinator[i].totalHeight;
                    }
                }
                // for (var j = 0; j < xy.length; j++) {
                //     if ((orderedWidgetsByCoordinator[i].x <= xy[j].x || orderedWidgetsByCoordinator[i].x2 > xy[j].x) && orderedWidgetsByCoordinator[i].y < xy[j].y2) {
                //         orderedWidgetsByCoordinator[i].y = xy[j].y2;
                //         orderedWidgetsByCoordinator[i].y2 = orderedWidgetsByCoordinator[i].y + orderedWidgetsByCoordinator[i].totalHeight;
                //     }
                // }
                xy.push({
                    x: orderedWidgetsByCoordinator[i].x,
                    y: orderedWidgetsByCoordinator[i].y,
                    x2: orderedWidgetsByCoordinator[i].x2,
                    y2: orderedWidgetsByCoordinator[i].y2,
                    totalHeight: orderedWidgetsByCoordinator[i].totalHeight
                });

            }
            return orderedWidgetsByCoordinator;
        }
        $scope.changeSize = function (paperType) {
            $scope.widgetwidth = 806;
            $scope.widgetheight = 1141;
            switch (paperType) {
                case "a4":
                    $scope.widgetwidth = 806;
                    // $scope.widgetheight = 1122.519685039;
                    $scope.widgetheight = 1141;
                    break;
                case "a3":
                    $scope.widgetwidth = 1587.4015;
                    /*$scope.widgetheight = 1122.519685039;*/
                    $scope.widgetheight = 1120;
                    break;
                case "a5":
                    $scope.widgetwidth = 793.7;
                    $scope.widgetheight = 559.370;
                    break;

            }
        };


        $scope.getPixelFromWidgetHeight = function (y) {
            var cellHeight = $scope.options.cellHeight;
            var verticalMargin = $scope.options.verticalMargin;
            var ans = (y * (cellHeight + verticalMargin) - verticalMargin);
            if (ans < 0) {
                return 0;
            }
            return ans;
        };


        $scope.getHeightFromPixel = function (pixelHeight) {
            var cellHeight = $scope.options.cellHeight;
            var verticalMargin = $scope.options.verticalMargin;
            return Math.ceil((pixelHeight + verticalMargin) / (cellHeight + verticalMargin));
        };

        $scope.duplicateHeadersAndFooters = function (headersItems, footersItems, maxPageNumber) {
            for (var p = 2; p <= maxPageNumber; p++) {
                var newHeaderItems = [];
                for (var i = 0; i < headersItems.length; i++) {
                    var pixel = $scope.getPixelFromWidgetHeight(headersItems[i].y);
                    pixel += $scope.widgetheight * ( p - 1) + ( p - 1) * 2;
                    //headersItems[i].y = $scope.getHeightFromPixel(pixel);
                    var newHeaderItem = angular.copy(headersItems[i]);
                    newHeaderItem.y = $scope.getHeightFromPixel(pixel);
                    newHeaderItems.push(newHeaderItem);
                }
                for (var i = 0; i < footersItems.length; i++) {
                    var pixel = $scope.getPixelFromWidgetHeight(footersItems[i].y);
                    pixel += $scope.widgetheight;
                    footersItems[i].y = $scope.getHeightFromPixel(pixel);
                }
                $scope.widgets = $scope.widgets.concat(angular.copy(newHeaderItems));
                $scope.widgets = $scope.widgets.concat(angular.copy(footersItems));
            }
        };

        $scope.orderWidgetsWithHeadersAndFooters = function () {
            var widgetHeight = $scope.options.cellHeight;
            // var counter= Math.ceil(($(".grid-stack").css('height').replace(/px/, "")-$scope.headerAreaHeight-$scope.footerAreaHeight)/$scope.widgetheight);
            var headersItems = [];
            var footersItems = [];
            var headerAreaHeight = $scope.headerAreaHeight;
            var footerAreaHeight = $scope.footerAreaHeight;
            var previousPageNumber = 2;
            var pixelsMargin = 0;
            var pageNumber = 1;
            var maxPageNumber = 1;
            for (var i = 0; i < $scope.widgets.length; i++) {

                var pixel = $scope.getPixelFromWidgetHeight($scope.widgets[i].y);
                if (pixel > $scope.widgetheight) {
                    pageNumber = Math.floor(pixel / ($scope.widgetheight - headerAreaHeight - footerAreaHeight)) + 1;
                    if (pageNumber > maxPageNumber) {
                        maxPageNumber = pageNumber;
                    }
                    pixel += headerAreaHeight * (pageNumber - 1) + footerAreaHeight * (pageNumber - 2) + pageNumber;
                    if (pageNumber * $scope.widgetheight - footerAreaHeight < pixel) {
                        pixel += footerAreaHeight + headerAreaHeight;
                    }
                    $scope.widgets[i].y = $scope.getHeightFromPixel(pixel);

                }
                else {
                    if (pixel > -1 && pixel <= $scope.headerAreaHeight) {
                        headersItems.push(angular.copy($scope.widgets[i]));
                    }
                    if (pixel >= ($scope.widgetheight - $scope.footerAreaHeight)) {
                        footersItems.push(angular.copy($scope.widgets[i]));
                    }
                }
            }
            $scope.duplicateHeadersAndFooters(headersItems, footersItems, maxPageNumber);
        };

        $scope.getPrintData = function () {
            // var data = {"objectTypeID": 10000, "objectID": 3};
            // var data = {"objectTypeID": 20000, "objectID": 425};
            var data = {"objectTypeID": $scope.content.objectTypeID, "objectID": $scope.content.objectID};
            if ($scope.content.type == 'object') {
                LeaderMESservice.GetPrintData(data).then(function (response) {

                    /*** check with avi*/
                    // if (true) {
                    // if (!response.error) {
                    if (!response.error) {
                        $scope.printData = response.PrintData;
                        var webStruct = JSON.parse(response.PrintStructureWeb);
                        if (webStruct) {
                            $scope.paperType = webStruct.paperType;
                            $scope.templateDir = webStruct.templateDir || 'ltr';
                            if (webStruct.headerAreaHeight != undefined)
                                $scope.headerAreaHeight = webStruct.headerAreaHeight;
                            else {
                                $scope.headerAreaHeight = $scope.defaultHeaderAreaHeight;
                            }
                            if (webStruct.footerAreaHeight != undefined)
                                $scope.footerAreaHeight = webStruct.footerAreaHeight;
                            else {
                                $scope.footerAreaHeight = $scope.defaultFooterAreaHeight;
                            }
                            if (webStruct.printSectionMargin != undefined){
                                $scope.printSectionMargin = webStruct.printSectionMargin;
                            }

                            $scope.changeSize($scope.paperType);
                            if (webStruct.pageCounter) {
                                $scope.pageCounter = webStruct.pageCounter;
                            }


                            $scope.PrintStructureWeb = webStruct.structureWeb;

                            // $scope.PrintStructureWeb = JSON.parse(response.PrintStructureWeb);
                            $scope.PrintStructure = JSON.parse(response.PrintStructure);

                        }


                    }
                    if (!$scope.PrintStructureWeb) {
                        $scope.PrintStructureWeb = [];
                    }
                    $scope.widgets = $scope.addValuesToStructureWeb($scope.PrintStructureWeb, $scope.printData);
                    $scope.orderWidgets($scope.widgets);
                    $scope.orderWidgetsWithHeadersAndFooters();
                });
            }
            else if ($scope.content.type == 'label') {

                LeaderMESservice.GetPrintStructureAndData(data).then(function (response) {

                    /*** check with avi*/
                    // if (true) {
                    // if (!response.error) {
                    if (!response.error) {
                        $scope.printData = response.PrintData;
                        var webStruct = JSON.parse(response.PrintStructureWeb);
                        if (webStruct) {
                            $scope.paperType = webStruct.paperType;
                            if (webStruct.headerAreaHeight)
                                $scope.headerAreaHeight = webStruct.headerAreaHeight;
                            if (webStruct.footerAreaHeight)
                                $scope.footerAreaHeight = webStruct.footerAreaHeight;
                            if (webStruct.printSectionMargin)
                                $scope.printSectionMargin = webStruct.printSectionMargin;
                            $scope.templateDir = webStruct.templateDir || 'ltr';
                            if (webStruct.headerAreaHeight != undefined)
                                $scope.headerAreaHeight = webStruct.headerAreaHeight;
                            else {
                                $scope.headerAreaHeight = $scope.defaultHeaderAreaHeight;
                            }
                            if (webStruct.footerAreaHeight != undefined)
                                $scope.footerAreaHeight = webStruct.footerAreaHeight;
                            else {
                                $scope.footerAreaHeight = $scope.defaultFooterAreaHeight;
                            }
                            if (webStruct.printSectionMargin != undefined)
                                $scope.printSectionMargin = webStruct.printSectionMargin;
                            if (webStruct.pageCounter) {
                                $scope.pageCounter = webStruct.pageCounter;
                            }
                            else {
                                $scope.pageCounter = 1;
                            }
                            $scope.changeSize($scope.paperType);

                            $scope.PrintStructureWeb = webStruct.structureWeb;

                            // $scope.PrintStructureWeb = JSON.parse(response.PrintStructureWeb);
                            $scope.PrintStructure = JSON.parse(response.PrintStructure);

                        }


                    }
                    if (!$scope.PrintStructureWeb) {
                        $scope.PrintStructureWeb = [];
                    }
                    $scope.widgets = $scope.addValuesToStructureWeb($scope.PrintStructureWeb, $scope.printData);
                    $scope.orderWidgets($scope.widgets);
                    $scope.orderWidgetsWithHeadersAndFooters();
                });

            }


        };
        $scope.getPrintData();

        // $scope.$on('ngRepeatPrintFinished', function (ngRepeatFinishedEvent) {
        //     $timeout(function () {
        //         $scope.printWidget('widgetArea');
        //     }, 500);
        // });

        $(".paperType").change(function () {
            if (this.value == 0) {
                $('.container-fluid').width(1000);
            }
            if (this.value == 1) {
                $('.container-fluid').width(1200);
            }
            if (this.value == 2) {
                $('.container-fluid').width(1500);
            }
        });
    };
    return {
        restrict: "E",
        templateUrl: template,
        scope: {
            content: '='
        },
        controller: controller
    };
}


function printListTemplateDirective() {

    var template = "views/common/printListTemplate.html";

    scope: {
        content: '='
    }
        var controller = function ($scope, LeaderMESservice, AuthService, $state, $log, $modal, $timeout, toastr, SweetAlert, $filter, notify, PRINT_CONSTANTS) {

        $scope.getNumArray = function (num) {
            return new Array(num);
        };

        $scope.isvisible = true;
        $scope.isvisible1 = true;
        $scope.isvisible2 = true;
        $scope.isvisible3 = true;
        $scope.staticDateNow = new Date();
        $scope.loadingTemplate = false;
        $scope.currentAttributeArray = [];
        // $scope.currentAttributeArray.length=1;
        $scope.arrayOfDates = ['datenow','datetimenow','timenow'];
        $scope.ReportsIDs = [];
        $scope.defaultHeaderAreaHeight = 60;
        $scope.defaultFooterAreaHeight = 60;
        $scope.defaultDir = 'center';
        $scope.printImagesFields = [];
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1; //January is 0!

        var yyyy = today.getFullYear();
        if (dd < 10) {
            dd = '0' + dd;
        }
        if (mm < 10) {
            mm = '0' + mm;
        }
        $scope.dateNow = dd + '/' + mm + '/' + yyyy;
        $scope.rtl = LeaderMESservice.isLanguageRTL();

        $scope.AttributeClickedArray = function (index) {

        }

        $scope.copyToHeaders = function () {
            var newWidgets = [];
            for (var i = 0; i < $scope.widgets.length; i++) {
                if ($scope.widgets[i].y >= 0 && $scope.widgets[i].y <= 2) {
                    for (var j = 0; j < $scope.lineSepratorHeader.length; j++) {
                        var currenty = $scope.widgetheight + $scope.widgets[i].y;
                        var newWidget = angular.copy($scope.widgets[i]);
                        newWidget.x = $scope.widgets[i].x;
                        newWidget.y = currenty;
                        newWidgets.push(newWidget);
                        break;
                    }
                }
            }
            $scope.widgets.concat(newWidgets);

        };

        $scope.copyToFooters = function () {

        };

        $scope.checkIfExistsInHeaderArea = function (ui) {
            if (ui && ui.position.top > 0 && ui.position.top < $scope.headerAreaHeight) {
                console.log("exists in header area")
                return true;
            }
            // else if(ui && ui.position.top>0 &&  ui.position.top<$scope.footerAreaHeight)
            // {
            //     $scope.copyToFooters();
            //    return false;
            // }
            console.log("not exists in header area")
            return false;

        };


        $scope.getExistingTemplate = function () {
            $scope.disablePrintTemplateButton = true;
            $scope.visible = false;
            $scope.widgets = [];
            // $scope.currentTemplateOptionAttributeField=currentTemplateOptionAttributeField;
            $scope.headerData = {};
            $scope.headerData.objectID = $scope.currentTemplateOption.ObjectTypeID;
            $scope.headerData.pairs = [];
            // if (type == 'label') {
            if ($scope.currentAttributeArray && $scope.currentAttributeArray.length) {
                for (var i = 0; i < $scope.currentAttributeArray.length; i++) {

                    // $scope.headerData.pairs.push({"FieldName":$scope.currentAttributeArray[i].attribute});
                    if ($scope.currentAttributeArray[i].type == 'report' && $scope.currentAttributeArray[i].field) {

                        $scope.headerData.pairs.push({
                            "FieldName": $scope.currentAttributeArray[i].FieldName,
                            "Eq": $scope.currentAttributeArray[i].field.ID,
                            "DataType": "num"
                        });
                    }
                    else {
                        if ($scope.currentAttributeArray[i].field && $scope.currentAttributeArray[i].field.ComboValueField) {
                            $scope.headerData.pairs.push({
                                "FieldName": $scope.currentAttributeArray[i].FieldName,
                                "Eq": $scope.currentAttributeArray[i].field.ComboValueField,
                                "DataType": "num"
                            });
                        }
                    }
                }
            }
            // if ($scope.ReportsIDs){
            // for(var j=0;j<$scope.ReportsIDs.length;j++)
            // {
            //     $scope.headerData.pairs.push({
            //         "FieldName": $scope.ReportsIDs[j].name,
            //         "Eq": $scope.currentAttributeArray[i].field.ComboValueField,
            //         "DataType": "num"
            //
            //     })
            // }}
            // }
            // else {
            //     if (currentTemplateOptionAttributeField) {
            //         $scope.headerData.pairs.push({
            //             "FieldName": $scope.currentTemplateOptionAttribute.FieldName,
            //             "Eq": currentTemplateOptionAttributeField.ComboValueField,
            //             "DataType": "num"
            //         });
            //     }
            // }
            // if($scope.ReportsIDs) {
            //     $scope.headerData.pairs.push({"FieldName": $scope.currentTemplateOptionAttribute, "value": $scope.ReportsIDs});
            // }

            LeaderMESservice.GetObjectPrintFieldsAndStructure($scope.headerData).then(function (response) {
                if (!response.error) {
                    $scope.PrintFields = _.find(response.PrintFields, {"ObjectTypeID": $scope.currentTemplateOption.ObjectTypeID});
                    $scope.Label = {};

                    var currentPrintField = $scope.PrintFields;
                    var currentTableFields = [];
                    if (currentPrintField.TableFields) {

                        for (var ob in currentPrintField.TableFields) {
                            currentTableFields.push({"Tbl": ob, "fields": currentPrintField.TableFields[ob]});
                        }
                    }
                    $scope.Label = {
                        TableFields: currentTableFields,
                        LName: currentPrintField.LName,
                        EName: currentPrintField.EName,
                        ObjectTypeID: currentPrintField.ObjectTypeID,
                        AttributeData: currentPrintField.AttributeData
                    };

                    $scope.RecordID = response.RecordID;
                    if ($scope.RecordID == 0) {
                        $scope.addDefaultToWidgets();
                    }
                    else {
                        $scope.isActive = response.isActive;
                    }


                    if (response.PrintStructureWeb && response.PrintStructureWeb.length > 0) {
                        $scope.PrintStructureWeb = JSON.parse(response.PrintStructureWeb);
                        $scope.PrintStructure = JSON.parse(response.PrintStructure);
                        // for(var i=0;i<$scope.PrintStructureWeb;i++)
                        // {
                        if ($scope.PrintStructureWeb) {
                            $scope.paperType = $scope.PrintStructureWeb.paperType;

                            if (!$scope.PrintStructureWeb.templateDir) {
                                $scope.templateDir = PRINT_CONSTANTS.templateDir;
                            }
                            else {
                                $scope.templateDir = $scope.PrintStructureWeb.templateDir;
                            }
                            $scope.updateTemplateDirection($scope.templateDir);
                            if (!$scope.PrintStructureWeb.headerAreaHeight) {
                                $scope.headerAreaHeight = $scope.defaultHeaderAreaHeight;
                            }
                            else {
                                $scope.headerAreaHeight = $scope.PrintStructureWeb.headerAreaHeight;
                            }
                            if (!$scope.PrintStructureWeb.footerAreaHeight) {
                                $scope.footerAreaHeight = $scope.defaultFooterAreaHeight;
                            }
                            else {
                                $scope.footerAreaHeight = $scope.PrintStructureWeb.footerAreaHeight;
                            }
                            if (!$scope.PrintStructureWeb.printSectionMargin) {
                                $scope.printSectionMargin = $scope.printSectionMargin;
                            } else {
                                $scope.printSectionMargin = $scope.PrintStructureWeb.printSectionMargin;
                            }
                        }

                        $scope.changeSize($scope.paperType);
                        if (!$scope.PrintStructureWeb)
                            $scope.widgets = [];
                        else {
                            if ($scope.PrintStructureWeb.structureWeb) {
                                $scope.widgets = $scope.PrintStructureWeb.structureWeb;
                            }

                        }
                    }
                    $scope.visible = true;
                    $timeout(function () {
                        $scope.draweLine()
                    }, 2000);


                }
                $scope.disablePrintTemplateButton = false;
                // $scope.Label=$scope.PrintFields;
            }, function () {
                $scope.disablePrintTemplateButton = false;
            });
            //
            // LeaderMESservice.GetPrintStructureAndData({"objectTypeID":,"objectID":0}).then(function (response) {
            //     if (!response.error) {
            //
            //     }
            // })

            $scope.showLabelArea = true;
            // }
            // else {
            //     $scope.showLabelArea = false;
            // }

        };

        $scope.currentAttributeClicked = function (current) {

        };

        $scope.addMoreAttribute = function () {
            $scope.currentAttributeArray.length += 1;
        };

        $scope.removeMoreAttribute = function (index) {
            $scope.currentAttributeArray.splice(index, 1);
        };

        $scope.labelChange = function (Label) {

            $scope.visible = true;
            $scope.Label = Label;
            var data = {
                "LabelID": $scope.Label.LabelID,
                "TemplateOptionID": $scope.currentTemplateOption.ID
            };

            if ($scope.ReportsIDs) {
                data.ReportsIDs = $scope.ReportsIDs;
            }
            if ($scope.currentTemplateOptionAttribute) {
                data.langID = $scope.currentTemplateOptionAttribute.ID;
            }
            // var data = {"objectTypeID": 10000, "printStructureLevel": 1, "printLevelRelatedID": 3};
            LeaderMESservice.GetLabelStructure(data).then(function (response) {

                if (!response.error && response.LabelStructure) {
                    if (response.LabelStructure.length == 0) {
                        $scope.widgets = [];

                    }
                    else {

                        $scope.LabelStructure = JSON.parse(response.LabelStructure[0].StructureWeb);
                        $timeout(function () {
                            JsBarcode(".barcode").init()
                        }, 2000);
                        $scope.paperType = $scope.LabelStructure.paperType;
                        $scope.headerAreaHeight = $scope.PrintStructureWeb.headerAreaHeight;
                        $scope.footerAreaHeight = $scope.PrintStructureWeb.footerAreaHeight;
                        $scope.printSectionMargin = $scope.PrintStructureWeb.printSectionMargin;
                        $scope.templateDir = $scope.LabelStructure.templateDir;

                        $scope.widgets = $scope.LabelStructure.structureWeb;
                        $scope.changeSize($scope.paperType);
                    }


                }

                // $scope.visible = true;
            })
        };

        $scope.changeSize = function (paperType) {
            switch (paperType) {
                case "a4":
                    $scope.widgetwidth = 806;
                    // $scope.widgetheight = 1122.519685039;
                    $scope.widgetheight = 1141;
                    break;
                case "a3":
                    $scope.widgetwidth = 1587.4015;
                    $scope.widgetheight = 1122.519685039
                    break;
                case "a5":
                    $scope.widgetwidth = 793.7;
                    $scope.widgetheight = 559.370;
                    break;

            }
            if ($scope.widgets && $scope.widgets.length > 0) {
                $scope.draweLine();
            }
        };


        $scope.AddNewObject = function (currentReport, index) {

            var modalInstance = $modal.open({
                templateUrl: 'views/common/mainContentTemplate.html',

                controller: function ($scope, $compile, $modalInstance, commonFunctions, reportID) {
                    $scope.reportID = reportID;
                    $scope.pageDisplay = 0;
                    $scope.returnValue = true;
                    $scope.onlyNewTab = true;
                    $scope.modal = true;
                    $scope.showBreadCrumb = false;
                    $scope.multiSelect = false;
                    commonFunctions.commonCodeSearch($scope);
                    $scope.getDisplayReportSearchFields();
                    $scope.ok = function () {
                        $modalInstance.close();
                    };

                    $scope.rowClicked = function (id, formID, fieldName, value) {
                        $modalInstance.close(value);
                    }
                },
                resolve: {

                    reportID: function () {

                        return currentReport;
                    }

                }
            }).result.then(function (value) {
                $scope.currentAttributeArray[index].field = value;
                $scope.currentAttributeArray[index].type = 'report';
                //  $scope.ReportsIDs.push({id:ID,name:EName,index:index});
                // $scope.ObjectEName = EName;
            });
        };

        $scope.widgets = [];
        if (!$scope.paperType) {
            $scope.paperType = "a4";
            $scope.changeSize($scope.paperType);
        }

        if (!$scope.templateDir) {
            $scope.templateDir = PRINT_CONSTANTS.templateDir;
        }

        $scope.options = {
            cellHeight: '1px',
            verticalMargin: 1,
            float: true,
            disableDrag: false,
            disableResize: false,
            // animate: true,
            // auto: true,
            // always_show_resize_handle: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
            resizable: {
                handles: 'e, se, s, sw, w'
            }

            // height: 10
        };

        if ($scope.content && $scope.content.type == 'object') {
            $scope.objectIsHidden = false;
            var data = {
                "objectTypeID": $scope.content.printLevelRelatedID,
                "printStructureLevel": $scope.content.printStructureLevel
            };

            LeaderMESservice.GetObjectPrintFields(data).then(function (response) {
                if (!response.error) {
                    $scope.PrintFields = response.PrintFields;

                }
            });
        }
        else if ($scope.content && $scope.content.type == 'label') {

            $scope.labelIsHidden = false;
            // var data = {
            //     "LabelID": $scope.content.LabelID,
            //     "TemplateOptionID": $scope.content.TemplateOptionID,
            //     "ObjectID": $scope.content.ObjectID,
            //     "langID": $scope.content.langID
            //
            // };
            //
            // LeaderMESservice.GetLabelStructure(data).then(function(response){
            //
            // });
            LeaderMESservice.GetObjectPrintOptions().then(function (response) {
                if (!response.error) {
                    $scope.TemplateOption = response.PrintFields;

                }

                // var temp={
                //     "ObjectTypes":
                //         [
                //             {
                //                 "ObjectTypeID":10000,
                //                 "LName":"מוצר",
                //                 "EName":"Product",
                //                 "AttributeData":
                //                     [
                //                         {
                //                             "AttributeID":9,
                //                             "AttributeEName":"Machine Type",
                //                             "AttributeLName":"סוג מכונה",
                //                             "DataType":"Combo",
                //                             "SearchLinkReportID":"",
                //                             "FieldName":"MachineType",
                //                             "ComboValues":
                //                                 [
                //                                     {
                //                                         "ComboIDField":1,
                //                                         "ComboEname":"Injection",
                //                                         "ComboLName":"הזרקה"
                //                                     },
                //                                     {
                //                                         "ComboIDField":2,
                //                                         "ComboEname":"Extrusion - Plate",
                //                                         "ComboLName":"Extrusion - Plate"
                //                                     },
                //                                     {
                //                                         "ComboIDField":3,
                //                                         "ComboEname":"BlowMolding",
                //                                         "ComboLName":"BlowMolding"
                //                                     }
                //                                 ]
                //
                //                         }
                //                     ]
                //             },
                //             {
                //                 "ObjectTypeID":20000,
                //                 "LName":"פקע",
                //                 "EName":"Job",
                //                 "AttributeData":
                //                     [
                //                         {
                //                             "AttributeID":1,
                //                             "AttributeEName":"Department",
                //                             "AttributeLName":"מחלקה",
                //                             "DataType":"Combo",
                //                             "SearchLinkReportID":"",
                //                             "FieldName":"Department",
                //                             "ComboValues":
                //                                 [
                //                                     {
                //                                         "ComboIDField":1,
                //                                         "ComboEname":"Injection",
                //                                         "ComboLName":"הזרקה"
                //                                     },
                //                                     {
                //                                         "ComboIDField":4,
                //                                         "ComboEname":"Assembly",
                //                                         "ComboLName":"הרכבה"
                //                                     },
                //                                     {
                //                                         "ComboIDField":8,
                //                                         "ComboEname":"Extrusion",
                //                                         "ComboLName":"שיחול"
                //                                     }
                //                                 ]
                //
                //                         },
                //                         {
                //                             "AttributeID":2,
                //                             "AttributeEName":"Machine Type",
                //                             "AttributeLName":"סוג מכונה",
                //                             "DataType":"Combo",
                //                             "SearchLinkReportID":"",
                //                             "FieldName":"MachineType",
                //                             "ComboValues":
                //                                 [
                //                                     {
                //                                         "ComboIDField":1,
                //                                         "ComboEname":"Injection",
                //                                         "ComboLName":"הזרקה"
                //                                     },
                //                                     {
                //                                         "ComboIDField":2,
                //                                         "ComboEname":"Extrusion - Plate",
                //                                         "ComboLName":"Extrusion - Plate"
                //                                     },
                //                                     {
                //                                         "ComboIDField":3,
                //                                         "ComboEname":"BlowMolding",
                //                                         "ComboLName":"BlowMolding"
                //                                     }
                //                                 ]
                //
                //                         }
                //                     ]
                //             },
                //             {
                //                 "ObjectTypeID":30000,
                //                 "LName":"פריט מלאי",
                //                 "EName":"Inventory Item",
                //                 "AttributeData":
                //                     [
                //                         {
                //                             "AttributeID":3,
                //                             "AttributeEName":"Client",
                //                             "AttributeLName":"לקוח",
                //                             "DataType":"Num",
                //                             "SearchLinkReportID":112,
                //                             "FieldName":"ClientID",
                //                             "ComboValues":
                //                                 [
                //                                 ]
                //
                //                         },
                //                         {
                //                             "AttributeID":4,
                //                             "AttributeEName":"Product Client",
                //                             "AttributeLName":"מוצר-לקוח",
                //                             "DataType":"Num",
                //                             "SearchLinkReportID":9999,
                //                             "FieldName":"ProductClientID",
                //                             "ComboValues":
                //                                 [
                //                                 ]
                //
                //                         },
                //                         {
                //                             "AttributeID":5,
                //                             "AttributeEName":"Product",
                //                             "AttributeLName":"מוצר",
                //                             "DataType":"Num",
                //                             "SearchLinkReportID":6,
                //                             "FieldName":"ProductID",
                //                             "ComboValues":
                //                                 [
                //                                 ]
                //
                //                         }
                //                     ]
                //             }
                //         ]
                //
                //
                // };

                // $scope.TemplateOption=temp.ObjectTypes;
            });

            // LeaderMESservice.GetLabelFieldsTemplateOption().then(function (response) {
            //     if (!response.error) {
            //
            //         $scope.LabelDataTemplate = response.LabelDataTemplate;
            //
            //     }
            // });
        }

        $scope.addNewAttributeRaw = function () {

        };

        $scope.deleteNewAttributeRaw = function () {

        };

        $scope.templateOptionClicked = function (currentTemplateOption) {

            $scope.ObjectID = null;
            $scope.ObjectEName = null;
            $scope.visible = false;
            $scope.currentAttributeArray = [];
            if (currentTemplateOption) {
                LeaderMESservice.GetPrintFileObjectsByObjectType({"sourceObjectType": currentTemplateOption.ObjectTypeID}).then(function (response) {
                    if (response.error == null) {
                        $scope.printImagesFields = response.PrintFileDetails;

                    }

                });
            }
            $scope.currentAttributeArray = currentTemplateOption.AttributeData;
            for (var i = 0; i < $scope.currentAttributeArray.length; i++) {
                $scope.currentAttributeArray[i].field = null;
            }
            $scope.currentTemplateOptionAttributeArray = [];
            $scope.currentTemplateOptionAttributeArray.length = 1;
            $scope.currentTemplateOptionAttributeFieldArray = [];
            $scope.currentLabels = _.find($scope.LabelDataTemplate, {'TemplateOptionID': currentTemplateOption.ID});
            $scope.currentTemplateOptionAttribute = null;
        };

        $scope.showLabelAreasArray = function () {

        };


        $scope.showLabelAreas = function (currentTemplateOptionAttributeField, type) {
            $scope.visible = false;
            $scope.widgets = [];
            if ($scope.ObjectID || currentTemplateOptionAttributeField) {
                // $scope.currentTemplateOptionAttributeField=currentTemplateOptionAttributeField;
                $scope.headerData = {};
                $scope.headerData.objectID = $scope.currentTemplateOption.ObjectTypeID;
                $scope.headerData.pairs = [];
                if (type == 'label') {
                    $scope.headerData.pairs.push({
                        "FieldName": $scope.ObjectEName,
                        "Eq": currentTemplateOptionAttributeField.ComboValueField,
                        "DataType": "num"
                    });
                }
                else {
                    if (currentTemplateOptionAttributeField) {
                        $scope.headerData.pairs.push({
                            "FieldName": $scope.currentTemplateOptionAttribute.FieldName,
                            "Eq": currentTemplateOptionAttributeField.ComboValueField,
                            "DataType": "num"
                        });
                    }
                }
                // if($scope.ObjectID) {
                //     $scope.headerData.pairs.push({"FieldName": $scope.currentTemplateOptionAttribute, "value": $scope.ObjectID});
                // }
                LeaderMESservice.GetObjectPrintFieldsAndStructure($scope.headerData).then(function (response) {
                    if (!response.error) {
                        $scope.PrintFields = _.find(response.PrintFields, {"ObjectTypeID": $scope.currentTemplateOption.ObjectTypeID});
                        $scope.Label = {};

                        var currentPrintField = $scope.PrintFields;
                        var currentTableFields = [];
                        if (currentPrintField.TableFields) {

                            for (var ob in currentPrintField.TableFields) {
                                currentTableFields.push({"Tbl": ob, "fields": currentPrintField.TableFields[ob]});
                            }
                        }
                        $scope.Label = {
                            TableFields: currentTableFields,
                            LName: currentPrintField.LName,
                            EName: currentPrintField.EName,
                            ObjectTypeID: currentPrintField.ObjectTypeID,
                            AttributeData: currentPrintField.AttributeData
                        };

                        $scope.RecordID = response.RecordID;
                        if ($scope.RecordID == 0) {
                            $scope.addDefaultToWidgets();
                        }
                        else {
                            $scope.isActive = response.isActive;
                        }

                        $scope.updateTemplateDirection($scope.templateDir);
                        if (response.PrintStructureWeb && response.PrintStructureWeb.length > 0) {
                            $scope.PrintStructureWeb = JSON.parse(response.PrintStructureWeb);
                            $scope.PrintStructure = JSON.parse(response.PrintStructure);
                            // for(var i=0;i<$scope.PrintStructureWeb;i++)
                            // {
                            if ($scope.PrintStructureWeb) {
                                $scope.paperType = $scope.PrintStructureWeb.paperType;

                                if (!$scope.PrintStructureWeb.templateDir) {
                                    $scope.templateDir = PRINT_CONSTANTS.templateDir;
                                }
                                else {
                                    $scope.templateDir = $scope.PrintStructureWeb.templateDir;
                                }
                            }

                            $scope.changeSize($scope.paperType);
                            if (!$scope.PrintStructureWeb)
                                $scope.widgets = [];
                            else {
                                if ($scope.PrintStructureWeb.structureWeb) {
                                    $scope.widgets = $scope.PrintStructureWeb.structureWeb;
                                }

                            }
                        }
                        $scope.visible = true;
                        $timeout(function () {
                            $scope.draweLine()
                        }, 2000);


                    }
                    // $scope.Label=$scope.PrintFields;
                });
                //
                // LeaderMESservice.GetPrintStructureAndData({"objectTypeID":,"objectID":0}).then(function (response) {
                //     if (!response.error) {
                //
                //     }
                // })
                $scope.showLabelArea = true;
            }
            else {
                $scope.showLabelArea = false;
            }
        };

        $scope.labelObjectClicked = function (ObjectID) {
            $scope.visible = false;
            $scope.ObjectID = ObjectID;

        };

        $scope.AttributeClicked = function (currentTemplateOptionAttribute) {

            $scope.currentTemplateOptionAttribute = currentTemplateOptionAttribute;
            $scope.currentTemplateOptionAttributeField = null;
            $scope.showLabelAreas();
        };

        $scope.AttributeClickedIndex = function (currentTemplateOptionAttribute, index) {
            $scope.currentTemplateOptionAttribute[index] = currentTemplateOptionAttribute;
        };

        $scope.labelGroupClicked = function (language) {
            $scope.visible = false;
            $scope.currentTemplateOptionAttribute = language;
        };

        var checkIfFileExist = function (struct) {

            for (var i = 0; i < struct.length; i++) {
                if (struct[i].typeContent == 'staticfield' && (struct[i].staticContent == 'image' || struct[i].staticContent == 'diagram')) {
                    struct[i].currentImageDiagramType = _.find($scope.PrintFields, {"ObjectTypeID": struct[i].currentImageDiagramType});
                }
            }
            return struct;
        };

        $scope.draweLine = function () {
            $scope.initCalcLineFrom = $('.grid-stack').offset().top;
            $timeout(function () {
                if ($(".printSection") && $(".printSection").css('height')) {
                    var pageNumber = ($(".grid-stack").css('height').replace(/px/, "") - ( $scope.headerAreaHeight + $scope.footerAreaHeight)) / ($scope.widgetheight - $scope.headerAreaHeight - $scope.footerAreaHeight + 0.0);
                    var actualHeight;
                    if (pageNumber != Math.ceil(pageNumber)) {
                        if (Math.ceil(pageNumber) > 1) {
                            var actualHeight = $scope.widgetheight + (Math.ceil(pageNumber) - 1) * ($scope.widgetheight - $scope.headerAreaHeight - $scope.footerAreaHeight);
                            $(".printSection").css('height', actualHeight + 'px');
                        }

                    }
                    else {
                        actualHeight = ($(".printSection").css('height').replace(/px/, "") - ($scope.widgetheight - $scope.headerAreaHeight - $scope.footerAreaHeight));
                    }
                    if (actualHeight)
                        $scope.lineSeprator = new Array((Math.ceil(actualHeight / ($scope.widgetheight - $scope.headerAreaHeight - $scope.footerAreaHeight))));
                    var height = $(".printSection").css('height').replace(/px/, "");

                    $scope.minwidthp = $(".printSection").css('width');
                }
            }, 500);

            // $scope.lineSepratorHeader = $scope.lineSeprator;
            // $scope.lineSepratorHeader.length=1;
            //
            // // $scope.lineSepratorHeader1=[]
            // // $scope.lineSepratorHeader1.length=1;
            // $scope.lineSeprator1=[]
            // $scope.lineSeprator1.length=1;

            // $scope.footerSeprator = new Array(Math.floor(parseInt($(".grid-stack").css('height').replace(/px/, "")) / 1200));
            // $scope.minwidthp = $(".grid-stack").css('width');
            // var minheightp = $(".grid-stack").css('min-height');
            // var minwidthp = $(".grid-stack").css('width');
            // var height = parseInt(heightp.replace(/px/, ""));
            // var minheight = parseInt(minheightp.replace(/px/, ""));
            // var currentHeight=minheight;
            // if (height < minheight) {
            //
            // }
            // else {
            //     for (; currentHeight < height;) {
            //         var myEl = angular.element(document.querySelector('.grid-stack'));
            //         myEl.append('<hr style="border: 1px dashed red;top: '+currentHeight+'px; position: absolute;width: '+minwidthp+';">');
            //         currentHeight += minheight;
            //
            //     }
            //     if(currentHeight==height)
            //     {
            //         myEl.append('<hr style="border: 1px dashed red;top: '+currentHeight+'px; position: absolute;width: '+minwidthp+';">');
            //     }
            // }
        };

        $scope.hideTemplate = function () {
            $scope.visible = false;
            $scope.widgets = [];
            $scope.showLabelArea = false;
            $scope.$apply();
        };

        $scope.addDefaultToWidgets = function () {
            $scope.headerAreaHeight = $scope.defaultHeaderAreaHeight;
            $scope.footerAreaHeight = $scope.defaultFooterAreaHeight;
            $scope.templateDir = PRINT_CONSTANTS.templateDir;
            $scope.isActive = true;
            $scope.updateTemplateDirection();
        };

        $scope.objectTypeClicked = function (objectType) {
            $scope.visible = false;
            $scope.widgets = [];
            /*TODO*/
            var data = {
                "objectTypeID": objectType.ObjectTypeID,
                "printStructureLevel": $scope.content.printStructureLevel,
                "printLevelRelatedID": $scope.content.printLevelRelatedID
            };

            // var data = {"objectTypeID": 10000, "printStructureLevel": 1, "printLevelRelatedID": 3};
            LeaderMESservice.GetPrintStructure(data).then(function (response) {
                if (!response.error) {
                    if ($scope.widgets && $scope.widgets.length > 0) {
                        for (var i = 0; i < $scope.widgets.length; i++) {
                            $timeout(function () {
                                JsBarcode(".barcode" + i).init();
                            }, 2000);
                        }
                    }
                    $scope.RecordID = response.RecordID;
                    if ($scope.RecordID == 0) {
                        $scope.addDefaultToWidgets();
                    }
                    else {
                        $scope.isActive = response.isActive;
                    }

                    if (response.PrintStructureWeb && response.PrintStructureWeb.length > 0) {
                        $scope.PrintStructureWeb = JSON.parse(response.PrintStructureWeb);
                        $scope.PrintStructure = JSON.parse(response.PrintStructure);
                        // for(var i=0;i<$scope.PrintStructureWeb;i++)
                        // {
                        if ($scope.PrintStructureWeb) {
                            $scope.paperType = $scope.PrintStructureWeb.paperType;
                            if ($scope.PrintStructureWeb.headerAreaHeight != undefined)
                                $scope.headerAreaHeight = $scope.PrintStructureWeb.headerAreaHeight;
                            else {
                                $scope.headerAreaHeight = $scope.defaultHeaderAreaHeight;
                            }
                            if ($scope.PrintStructureWeb.footerAreaHeight != undefined)
                                $scope.footerAreaHeight = $scope.PrintStructureWeb.footerAreaHeight;
                            else {
                                $scope.footerAreaHeight = $scope.defaultFooterAreaHeight;
                            }
                            if ($scope.PrintStructureWeb.printSectionMargin != undefined)
                                $scope.printSectionMargin = $scope.PrintStructureWeb.printSectionMargin;

                            if (!$scope.PrintStructureWeb.templateDir) {
                                $scope.templateDir = PRINT_CONSTANTS.templateDir;
                            }
                            else {
                                $scope.templateDir = $scope.PrintStructureWeb.templateDir;
                            }
                            $scope.updateTemplateDirection($scope.templateDir);
                            if ($scope.PrintStructureWeb.headerAreaHeight != undefined)
                                $scope.headerAreaHeight = $scope.PrintStructureWeb.headerAreaHeight;
                            else {
                                $scope.headerAreaHeight = $scope.defaultHeaderAreaHeight;
                            }
                            if ($scope.PrintStructureWeb.footerAreaHeight != undefined)
                                $scope.footerAreaHeight = $scope.PrintStructureWeb.footerAreaHeight;
                            else {
                                $scope.footerAreaHeight = $scope.defaultFooterAreaHeight;
                            }
                        }

                        $scope.changeSize($scope.paperType);
                        if (!$scope.PrintStructureWeb) {
                            $scope.widgets = [];
                        }
                        else {
                            if ($scope.PrintStructureWeb.structureWeb) {
                                $scope.widgets = checkIfFileExist($scope.PrintStructureWeb.structureWeb);
                            }

                        }
                    }
                    $scope.visible = true;
                    $timeout(function () {
                        $scope.draweLine()
                    }, 2000);

                }

            });
        };

        $scope.updateTemplateDirection = function (dir) {
            $scope.templateDir = dir;
            $('.printDisplay1').removeClass('printDisplayActive');
            $('.printDisplay2').removeClass('printDisplayActive');

            if (dir == 'rtl') {
                $('.printDisplay2').addClass('printDisplayActive');
            }
            else {
                $('.printDisplay1').addClass('printDisplayActive');
            }
        };

        $scope.duplicateItem = function (w) {
            var maxy = 0;
            for (var i = 0; i < $scope.widgets.length; i++) {
                if ($scope.widgets[i].y > maxy) {
                    maxy = $scope.widgets[i].y + $scope.widgets[i].height;
                }

            }
            var currenth = $scope.getHeightFromPixel($scope.headerAreaHeight);
            if (maxy < currenth) {
                maxy = currenth;

            }

            var newWidget = angular.copy(w);
            if ($scope.rtl) {
                newWidget.x = 8;
            }
            else {
                newWidget.x = 0;
            }
            newWidget.y = maxy;
            $scope.widgets.push(newWidget);
            $scope.draweLine();
        };

        $scope.cloning = function () {

            var modalInstance = $modal.open({
                templateUrl: 'views/common/cloning.html',
                resolve: {
                    currentAttributeArray: function () {
                        return $scope.currentAttributeArray
                    },
                    currentTemplateOptionid: function () {
                        return $scope.currentTemplateOption.ObjectTypeID
                    }
                },
                controller: function ($scope, $compile, $modalInstance, Upload, $sessionStorage, $filter, currentAttributeArray, currentTemplateOptionid) {
                    $scope.noTemplateToClone = false;
                    var cloneModalCtrl = this;
                    cloneModalCtrl.currentAttributeArray = currentAttributeArray;
                    cloneModalCtrl.close = function () {
                        $modalInstance.close();
                    };


                    cloneModalCtrl.exit = function () {
                        $modalInstance.close('exit');
                    };
                    cloneModalCtrl.clone = function () {
                        $scope.noTemplateToClone = false;
                        $scope.headerData = {};
                        $scope.headerData.objectID = currentTemplateOptionid;
                        $scope.headerData.pairs = [];
                        if (cloneModalCtrl.currentAttributeArray && cloneModalCtrl.currentAttributeArray.length) {
                            for (var i = 0; i < cloneModalCtrl.currentAttributeArray.length; i++) {

                                // $scope.headerData.pairs.push({"FieldName":$scope.currentAttributeArray[i].attribute});
                                if (cloneModalCtrl.currentAttributeArray[i].type == 'report' && cloneModalCtrl.currentAttributeArray[i].field) {

                                    $scope.headerData.pairs.push({
                                        "FieldName": cloneModalCtrl.currentAttributeArray[i].FieldName,
                                        "Eq": cloneModalCtrl.currentAttributeArray[i].cloningfield.ID,
                                        "DataType": "num"
                                    });
                                }
                                else {
                                    if (cloneModalCtrl.currentAttributeArray[i].cloningfield && cloneModalCtrl.currentAttributeArray[i].cloningfield.ComboValueField) {
                                        $scope.headerData.pairs.push({
                                            "FieldName": cloneModalCtrl.currentAttributeArray[i].FieldName,
                                            "Eq": cloneModalCtrl.currentAttributeArray[i].cloningfield.ComboValueField,
                                            "DataType": "num"
                                        });
                                    }
                                }
                            }
                        }

                        LeaderMESservice.GetObjectPrintFieldsAndStructure($scope.headerData).then(function (response) {
                            if (!response.error) {
                                if (response.PrintStructureWeb !== null) {
                                    $modalInstance.close(response);
                                    $scope.noTemplateToClone = false;
                                }
                                else {
                                    $scope.noTemplateToClone = true;
                                }

                                //check if template have data

                            }
                            else {
                                $scope.noTemplateToClone = true;
                            }


                        });


                    }
                },
                controllerAs: 'cloneModalCtrl'
            }).result.then(function (response) {

                if (response && response !== 'exit') {
                    $scope.visible = false;
                    $scope.widgets = [];
                    // $scope.currentTemplateOptionAttributeField=currentTemplateOptionAttributeField;
                    // $scope.headerData = {};
                    // $scope.headerData.objectID = $scope.currentTemplateOption.ObjectTypeID;
                    // $scope.headerData.pairs = [];
                    // if (type == 'label') {
                    // if (result && result.length) {
                    //     for (var i = 0; i < result.length; i++) {
                    //
                    //         // $scope.headerData.pairs.push({"FieldName":$scope.currentAttributeArray[i].attribute});
                    //         if (result[i].type == 'report' && result[i].field) {
                    //
                    //             $scope.headerData.pairs.push({
                    //                 "FieldName": result[i].FieldName,
                    //                 "Eq": result[i].cloningfield.ID,
                    //                 "DataType": "num"
                    //             });
                    //         }
                    //         else {
                    //             if (result[i].cloningfield && result[i].cloningfield.ComboValueField) {
                    //                 $scope.headerData.pairs.push({
                    //                     "FieldName": result[i].FieldName,
                    //                     "Eq": result[i].cloningfield.ComboValueField,
                    //                     "DataType": "num"
                    //                 });
                    //             }
                    //         }
                    //     }
                    // }


                    // LeaderMESservice.GetObjectPrintFieldsAndStructure($scope.headerData).then(function (response) {
                    if (!response.error) {
                        if (response.PrintStructureWeb !== null) {
                            $scope.PrintFields = _.find(response.PrintFields, {"ObjectTypeID": $scope.currentTemplateOption.ObjectTypeID});
                            $scope.Label = {};

                            var currentPrintField = $scope.PrintFields;
                            var currentTableFields = [];
                            if (currentPrintField.TableFields) {

                                for (var ob in currentPrintField.TableFields) {
                                    currentTableFields.push({
                                        "Tbl": ob,
                                        "fields": currentPrintField.TableFields[ob]
                                    });
                                }
                            }
                            $scope.Label = {
                                TableFields: currentTableFields,
                                LName: currentPrintField.LName,
                                EName: currentPrintField.EName,
                                ObjectTypeID: currentPrintField.ObjectTypeID,
                                AttributeData: currentPrintField.AttributeData
                            };

                            $scope.RecordID = response.RecordID;
                            if ($scope.RecordID == 0) {
                                $scope.addDefaultToWidgets();
                            }
                            else {
                                $scope.isActive = response.isActive;
                            }

                            $scope.updateTemplateDirection($scope.templateDir);
                            if (response.PrintStructureWeb && response.PrintStructureWeb.length > 0) {
                                $scope.PrintStructureWeb = JSON.parse(response.PrintStructureWeb);
                                $scope.PrintStructure = JSON.parse(response.PrintStructure);
                                // for(var i=0;i<$scope.PrintStructureWeb;i++)
                                // {
                                if ($scope.PrintStructureWeb) {
                                    $scope.paperType = $scope.PrintStructureWeb.paperType;

                                    if (!$scope.PrintStructureWeb.templateDir) {
                                        $scope.templateDir = PRINT_CONSTANTS.templateDir;
                                    }
                                    else {
                                        $scope.templateDir = $scope.PrintStructureWeb.templateDir;
                                    }
                                    if ($scope.PrintStructureWeb.headerAreaHeight != undefined)
                                        $scope.headerAreaHeight = $scope.PrintStructureWeb.headerAreaHeight;
                                    else {
                                        $scope.headerAreaHeight = $scope.defaultHeaderAreaHeight;
                                    }
                                    if ($scope.PrintStructureWeb.footerAreaHeight != undefined)
                                        $scope.footerAreaHeight = $scope.PrintStructureWeb.footerAreaHeight;
                                    else {
                                        $scope.footerAreaHeight = $scope.defaultFooterAreaHeight;
                                    }
                                    if ($scope.PrintStructureWeb.printSectionMargin != undefined)
                                        $scope.printSectionMargin = $scope.PrintStructureWeb.printSectionMargin;
                                }

                                $scope.changeSize($scope.paperType);
                                if (!$scope.PrintStructureWeb)
                                    $scope.widgets = [];
                                else {
                                    if ($scope.PrintStructureWeb.structureWeb) {
                                        $scope.widgets = $scope.PrintStructureWeb.structureWeb;
                                    }

                                }
                            }
                            $scope.visible = true;
                            $timeout(function () {
                                $scope.draweLine()
                            }, 2000);


                        }
                        else {
                            //warning message

                        }
                    }

                    // $scope.Label=$scope.PrintFields;
                    // });
                    //
                    // LeaderMESservice.GetPrintStructureAndData({"objectTypeID":,"objectID":0}).then(function (response) {
                    //     if (!response.error) {
                    //
                    //     }
                    // })

                    $scope.showLabelArea = true;
                    // }
                    // else {
                    //     $scope.showLabelArea = false;
                    // }
                }
            });
            $scope.draweLine();
        };


        // }
        $scope.getHeightFromPixel = function (pixelHeight) {
            var cellHeight = $scope.options.cellHeight;
            var verticalMargin = $scope.options.verticalMargin;
            return Math.ceil((pixelHeight + verticalMargin) / (cellHeight + verticalMargin));
        };
        $scope.addWidget = function () {
            var maxy = 0;
            var x = 0;
            for (var i = 0; i < $scope.widgets.length; i++) {
                if ($scope.widgets[i].y + $scope.widgets[i].height > maxy) {
                    maxy = $scope.widgets[i].y + $scope.widgets[i].height;
                }

            }

            var currenth = $scope.getHeightFromPixel($scope.headerAreaHeight);
            if (maxy < currenth) {
                maxy = currenth;

            }
            if ($scope.rtl) {
                x = 8;
            }
            var newWidget = {
                x: x,
                y: maxy,
                width: 4,
                height: 20,
                auto: 0,
                fontColor: "",
                backgroundColor: "",
                tableType: "",
                typeContent: ""
            };
            if (!$scope.widgets)
                $scope.widgets = [];
            $scope.widgets.push(newWidget);
            $scope.draweLine();
        };


        $scope.addTableWidget = function () {
            var newWidget = {
                x: 0,
                y: 1,
                width: 100,
                height: 1,
                auto: 0,
                fontColor: "",
                backgroundColor: "",
                tableType: ""
            };
            if (!$scope.widgets)
                $scope.widgets = [];
            $scope.widgets.push(newWidget);
        };


        $scope.addWidgetItem = function (item, index) {
            if ($scope.widgets != undefined) {
                var widget = $scope.widgets[index];
            }
            var modalInstance = $modal.open({
                templateUrl: 'views/common/updatPrintListTemplateBoxField.html',
                resolve: {
                    contentType: function () {
                        return $scope.content;
                    },
                    currentTypeValue: function () {
                        if ($scope.content.type == 'object') {
                            return $scope.currentObjectType;
                        }
                        else if ($scope.content.type == 'label') {

                            return $scope.PrintFields;
                            // if ($scope.currentTemplateOption) {
                            //     // if ($scope.currentTemplateOption.RID == 0) {
                            //
                            //     return _.find($scope.LabelDataTemplate, {"TemplateOptionID": $scope.currentTemplateOption.ID});
                            // }
                            // }
                        }
                    },
                    PrintFields: function () {

                        // if ($scope.content.type == 'object') {
                        return $scope.PrintFileDetails;
                        // }
                    },
                    templateDir: function () {
                        return $scope.templateDir;
                    },
                    label: function () {

                        return $scope.Label;
                    },
                    currentLabelField: function () {
                        return $scope.LabelTableField;
                    },
                    printImagesFields: function () {
                        return $scope.printImagesFields;
                    }

                },
                controller: function ($scope, $compile, $modalInstance, contentType, currentTypeValue, Upload, $sessionStorage, PrintFields, $filter, templateDir, PRINT_CONSTANTS, label, currentLabelField, printImagesFields) {

                    var printModalCtrl = this;
                    printModalCtrl.printImagesFields = printImagesFields;
                    printModalCtrl.rtl = LeaderMESservice.isLanguageRTL();
                    printModalCtrl.inputMaxlength = PRINT_CONSTANTS.barcodeStringLength;
                    printModalCtrl.inputMinlength = 1;
                    printModalCtrl.templateDir = templateDir;
                    printModalCtrl.contentType = contentType;
                    printModalCtrl.currentTypeValue = currentTypeValue;
                    printModalCtrl.defaultrowHeight = '100px';
                    printModalCtrl.arrayOfDates = ['datenow', 'datetimenow', 'timenow'];
                    printModalCtrl.defaultrowWidth = 40;
                    printModalCtrl.defaultfontSize = 7;
                    printModalCtrl.defaultpercentWidth = 100;
                    printModalCtrl.defaultbackgroundColor = 'white';
                    printModalCtrl.defaultfontColor = 'black';
                    printModalCtrl.defaultfontWeightKeys = false;
                    printModalCtrl.defaultfontWeightValues = false;
                    printModalCtrl.defaultfontUnderlineKeys = false;
                    printModalCtrl.defaultfontUnderlineValues = false;
                    printModalCtrl.defaultstartFromRow = 1;
                    printModalCtrl.defaultToRow = 5;
                    printModalCtrl.defaultNumberOfRowsValues = 6;
                    printModalCtrl.defaultNumberOfColsValues = 6;
                    printModalCtrl.numOfRowsValues = 6;
                    printModalCtrl.numOfColsValues = 6;
                    printModalCtrl.noTitleKeys = false;
                    if (printModalCtrl.templateDir == 'rtl') {
                        printModalCtrl.defaultDir = 'right';
                    }
                    else {
                        printModalCtrl.defaultDir = 'left';
                    }

                    printModalCtrl.staticDateNow = new Date();
                    printModalCtrl.style = "";

                    printModalCtrl.Label = label;

                    // printModalCtrl.TableFieldsArray=[];
                    // if(printModalCtrl.Label)
                    // {
                    // for(var label in printModalCtrl.Label.TableFields)
                    // {
                    //
                    //     printModalCtrl.TableFieldsArray.push({"Table":label,"Values":printModalCtrl.Label.TableFields[label]});
                    // }
                    // }

                    $timeout(function () {
                        JsBarcode(".barcode").init()
                    }, 1000);
                    // if (contentType == 'label' && item.typeContent == "dynamicfield") {
                    //     printModalCtrl.style = item.style;
                    //     // if (item.LabelID) {
                    //     //     printModalCtrl.Label = _.find(printModalCtrl.currentTypeValue.Labels, {"LabelID": item.LabelID});
                    //     //     if (printModalCtrl.Label && item.Labelfields) {
                    //
                    //     if (printModalCtrl.Label) {
                    //         printModalCtrl.LabelTableField = _.find(printModalCtrl.Label.Labelfields, {"LabelID": item.Labelfields.LabelID});
                    //     }
                    //     // }
                    //     // printModalCtrl.LabelTableField = item.Labelfields;
                    // }
                    printModalCtrl.printFields = PrintFields;
                    if (item.currentImageDiagramType) {
                        item.currentImageDiagramType = _.find(printModalCtrl.printImagesFields, item.currentImageDiagramType);
                    }
                    // printModalCtrl.currentFileType = _.find(PrintFields, function(row){
                    //     if(row.ObjectTypeID==item.currentFileType.ObjectTypeID)
                    //    return true;
                    //     else return false;
                    // });

                    /* init*/
                    // if (item.typeContent)
                    printModalCtrl.typeContent = item.typeContent;

                    printModalCtrl.updateColumnTDirection = function (dir, index) {
                        printModalCtrl.currentFieldsModified[index].tdir = dir;
                    };

                    printModalCtrl.getNumArray = function (num) {
                        return new Array(num);
                    };

                    printModalCtrl.updateDirection = function (dir, isTitle) {
                        if (isTitle) {
                            printModalCtrl.tdir = dir;
                        }
                        else {
                            printModalCtrl.dir = dir;
                        }
                    };

                    printModalCtrl.updateColumnDirection = function (dir, index) {
                        // if(dir=='ltr')
                        // {
                        printModalCtrl.currentFieldsModified[index].dir = dir;
                        // $('.printMDisplay span').removeClass('printDisplayActive');
                        //
                        // if (dir == 'rtl') {
                        //     $('.printMDisplay2').addClass('printDisplayActive');
                        // }
                        // else {
                        //     $('.printMDisplay1').addClass('printDisplayActive');
                        // }
                        // }
                        // else{
                        //
                        // }
                    };

                    printModalCtrl.clearLabelField = function (type) {
                        // if(type=='labelfield')
                        // {
                        //     printModalCtrl.LabelTableField = null;
                        //
                        // }
                        // else if(type=='labelTable')
                        // {
                        //     printModalCtrl.LabelTableField = null;
                        // }
                        // else if(type=='type')
                        // {
                        //     printModalCtrl.LabelTableField = null;
                        //     printModalCtrl.labelTable = null;
                        // }
                    };

                    printModalCtrl.close = function () {
                        $modalInstance.close();
                    };

                    printModalCtrl.clearDefaultFields = function () {
                        printModalCtrl.backgroundColor = printModalCtrl.defaultbackgroundColor;
                        printModalCtrl.fontColor = printModalCtrl.defaultfontColor;
                        printModalCtrl.fontSize = printModalCtrl.defaultfontSize;
                        printModalCtrl.backgroundColorValues = printModalCtrl.defaultbackgroundColor;
                        printModalCtrl.fontColorValues = printModalCtrl.defaultfontColor;
                        printModalCtrl.fontSizeValues = printModalCtrl.defaultfontSize;
                        printModalCtrl.fontWeightKeys = null;
                        // default value is true for border, there is no null
                        printModalCtrl.textHasBorder = 'true';
                        printModalCtrl.borderStyle = 'solid';
                        printModalCtrl.fontUnderlineKeys = null;
                        printModalCtrl.fontUnderlineValues = null;
                        printModalCtrl.fontWeightValues = null;
                        printModalCtrl.fontItalicValues = null;
                        printModalCtrl.fontItalicKeys = null;
                        printModalCtrl.noTitleKeys = null;
                    }


                    printModalCtrl.clearAll = function (current) {
                        if (!current) {
                            printModalCtrl.typeContent = "";
                        }
                        printModalCtrl.currentTable = null;
                        printModalCtrl.currentFields = null;
                        printModalCtrl.style = "";
                        // printModalCtrl.Label = null;
                        printModalCtrl.LabelTableField = null;
                        printModalCtrl.staticContent = "";
                        printModalCtrl.staticText = null;
                        printModalCtrl.currentImageDiagramType = null;
                        printModalCtrl.currentFileID = "";
                        // if (printModalCtrl.typeContent !== 'barcode')
                        // { printModalCtrl.barcode = {};
                        //     }
                        printModalCtrl.backgroundColor = printModalCtrl.defaultbackgroundColor;
                        printModalCtrl.fontColor = printModalCtrl.defaultfontColor;
                        printModalCtrl.fontSize = printModalCtrl.defaultfontSize;
                        printModalCtrl.valuesbackgroundColor = printModalCtrl.defaultbackgroundColor;
                        printModalCtrl.valuesfontColor = printModalCtrl.defaultfontColor;
                        printModalCtrl.valuesfontSize = printModalCtrl.defaultfontSize;
                        printModalCtrl.fontWeightKeys = null;
                        // default value is true for border, there is no null
                        printModalCtrl.textHasBorder = 'true';
                        printModalCtrl.borderStyle = 'solid';
                        printModalCtrl.fontUnderlineKeys = null;
                        printModalCtrl.fontUnderlineValues = null;
                        printModalCtrl.currentFieldsModified = null;
                        // printModalCtrl.LabelTableField = null;
                        printModalCtrl.staticText = null;

                        printModalCtrl.cellKeyHeight = null;
                        printModalCtrl.cellValueHeight = null;
                        printModalCtrl.cellKeyWidth = null;
                        printModalCtrl.cellValueWidth = null;
                        printModalCtrl.dir = printModalCtrl.defaultDir;
                        printModalCtrl.tdir = printModalCtrl.defaultDir;

                        printModalCtrl.fontItalicKeys = null;
                        printModalCtrl.noTitleKeys = null;
                        printModalCtrl.fontWeightValues = null;
                        printModalCtrl.fontSizeValues = printModalCtrl.defaultfontSize;
                        printModalCtrl.fontUnderlineValues = null;
                        printModalCtrl.fontItalicValues = null;
                        printModalCtrl.backgroundColorValues = printModalCtrl.defaultbackgroundColor;
                        printModalCtrl.fontColorValues = printModalCtrl.defaultfontColor;

                        printModalCtrl.numberOfRowsValues = printModalCtrl.defaultNumberOfRowsValues;
                        printModalCtrl.numberOfColsValues = printModalCtrl.defaultNumberOfColsValues;
                        printModalCtrl.startFromRowValues = printModalCtrl.defaultstartFromRow;
                        printModalCtrl.qrcode = {};
                    };

                    printModalCtrl.refreshNumberOfRowsValues = function (start) {
                        if (printModalCtrl.startFromRowValues < 0) {
                            printModalCtrl.startFromRowValues++;
                            return;
                        }
                        if (printModalCtrl.toRowValues < 0) {
                            printModalCtrl.toRowValues++;
                            return;
                        }
                        if (start && printModalCtrl.startFromRowValues > printModalCtrl.toRowValues) {
                            printModalCtrl.startFromRowValues--;
                        }
                        printModalCtrl.numberOfRowsValues = printModalCtrl.toRowValues - printModalCtrl.startFromRowValues + 1;
                    };

                    printModalCtrl.removeKeyValueDetails = function (index) {
                        if (index == 1) {
                            // printModalCtrl.Label = null;
                        }
                        if (index == 1 || index == 2) {
                            printModalCtrl.LabelTableField = null;
                        }

                        printModalCtrl.backgroundColor = printModalCtrl.defaultbackgroundColor;
                        printModalCtrl.backgroundColorValues = printModalCtrl.defaultbackgroundColor;
                        printModalCtrl.fontColor = printModalCtrl.defaultfontColor;
                        printModalCtrl.fontColorValues = printModalCtrl.defaultfontColor;
                        printModalCtrl.fontSize = printModalCtrl.defaultfontSize;
                        printModalCtrl.fontSizeValues = printModalCtrl.defaultfontSize;
                        printModalCtrl.fontWeightKeys = null;
                        // default value is true for border, there is no null
                        printModalCtrl.textHasBorder = 'true';
                        printModalCtrl.borderStyle = 'solid';
                        printModalCtrl.fontUnderlineKeys = null;
                        printModalCtrl.fontUnderlineValues = null;
                        printModalCtrl.fontWeightValues = null;
                        printModalCtrl.fontItalicKeys = null;
                        printModalCtrl.noTitleKeys = null;
                        printModalCtrl.fontItalicValues = null;
                        printModalCtrl.cellValueHeight = 50;
                        printModalCtrl.cellValueWidth = 50;
                        printModalCtrl.cellKeyHeight = 50;
                        printModalCtrl.cellKeyWidth = 50;
                        printModalCtrl.dir = printModalCtrl.defaultDir;
                        printModalCtrl.tdir = printModalCtrl.defaultDir;
                    };

                    printModalCtrl.removeNullFields = function (currentFields) {
                        var newCurrentFields = [];
                        for (var i = 0; i < currentFields.length; i++) {
                            if (!printModalCtrl.rtl) {
                                if (currentFields[i].EName) {
                                    newCurrentFields.push(currentFields[i]);
                                }
                            }
                            else {
                                if (currentFields[i].LName)
                                    newCurrentFields.push(currentFields[i]);
                            }
                        }
                        return newCurrentFields;
                    };

                    printModalCtrl.typeContentClicked = function () {
                        if (printModalCtrl.typeContent == 'table' || printModalCtrl.typeContent == 'barcode' || printModalCtrl.typeContent == 'qrcode') {

                            if (printModalCtrl.typeContent == 'table') {
                                printModalCtrl.barcodeType = undefined;
                                printModalCtrl.qrcodeType = undefined;
                            }
                            else if (printModalCtrl.typeContent == 'barcode') {
                                printModalCtrl.qrcodeType = undefined;
                            }
                            else if (printModalCtrl.typeContent == 'qrcode') {
                                printModalCtrl.barcodeType = undefined;
                            }

                            printModalCtrl.tables = [];
                            if (printModalCtrl.currentTypeValue) {
                                for (var table in printModalCtrl.currentTypeValue.TableFields) {
                                    if (printModalCtrl.currentTypeValue && printModalCtrl.currentTypeValue.TableFields[table] && printModalCtrl.currentTypeValue.TableFields[table].length > 0) {
                                        var currentFields = printModalCtrl.currentTypeValue.TableFields[table];
                                        if (currentFields) {
                                            currentFields = printModalCtrl.removeNullFields(currentFields);


                                            currentFields.sort(function (a, b) {
                                                if (!printModalCtrl.rtl) {
                                                    if (!a.EName || !b.LName) return -1;
                                                    if (a.EName.trim() < b.EName.trim()) return -1;
                                                    if (a.EName.trim() > b.EName.trim()) return 1;
                                                }
                                                else {
                                                    if (!a.LName || !b.LName) return -1;
                                                    if (a.LName.trim() < b.LName.trim()) return -1;
                                                    if (a.LName.trim() > b.LName.trim()) return 1;
                                                }
                                                return 0;
                                            });
                                        }
                                        printModalCtrl.tables.push({
                                            "table": table,
                                            "fields": currentFields,
                                            "ename": printModalCtrl.currentTypeValue.TableFields[table][0].DisplayEName,
                                            "lname": printModalCtrl.currentTypeValue.TableFields[table][0].DisplayLName,

                                        });
                                    }
                                }
                            }


                            printModalCtrl.staticContent = "";
                            printModalCtrl.staticText = null;
                            printModalCtrl.backgroundColor = printModalCtrl.defaultbackgroundColor;
                            printModalCtrl.clearAll(true);
                        }
                        else if (printModalCtrl.typeContent == 'staticfield') {
                            printModalCtrl.staticContent = "";
                            printModalCtrl.staticText = null;
                            printModalCtrl.backgroundColor = printModalCtrl.defaultbackgroundColor;
                            printModalCtrl.clearAll(true);
                        }
                        else if (printModalCtrl.typeContent == 'dynamicfield') {
                            printModalCtrl.clearAll(true);
                        }
                    };

                    printModalCtrl.barcodeFieldClicked = function () {
                        printModalCtrl.generateBarcode(undefined, undefined, true);
                    };

                    printModalCtrl.typeContentClicked();

                    printModalCtrl.clearBarcode = function () {
                        printModalCtrl.currentFields = null;
                        printModalCtrl.currentTable = null;
                        printModalCtrl.showBarcode = false;
                        printModalCtrl.showBarcodeErrorMessage = false;
                        // delete printModalCtrl.barcode.text;
                        printModalCtrl.barcode = {};
                        // printModalCtrl.Label = null;
                        printModalCtrl.LabelTableField = null;
                    };

                    printModalCtrl.clearQrcode = function () {
                        printModalCtrl.currentFields = null;
                        printModalCtrl.currentTable = null;
                        printModalCtrl.qrcode = {};
                        // if (printModalCtrl.qrcode) {
                        //     printModalCtrl.qrcode.text = "";
                        // }
                    };

                    /** add default values if values not exists*/

                    if (!item.rowHeight)
                        printModalCtrl.rowHeight = printModalCtrl.defaultrowHeight;
                    else
                        printModalCtrl.rowHeight = item.rowHeight;
                    if (!item.fontSize)
                        printModalCtrl.fontSize = printModalCtrl.defaultfontSize;
                    else
                        printModalCtrl.fontSize = item.fontSize;

                    if (!item.backgroundColor)
                        printModalCtrl.backgroundColor = printModalCtrl.defaultbackgroundColor;
                    else
                        printModalCtrl.backgroundColor = item.backgroundColor;
                    if (!item.fontColor)
                        printModalCtrl.fontColor = printModalCtrl.defaultfontColor;
                    else
                        printModalCtrl.fontColor = item.fontColor;
                    if (!item.dir) {
                        printModalCtrl.dir = printModalCtrl.defaultDir;
                    }
                    else {
                        printModalCtrl.dir = item.dir;
                    }
                    if (!item.tdir) {
                        printModalCtrl.tdir = printModalCtrl.defaultDir;
                    }
                    else {
                        printModalCtrl.tdir = item.tdir;
                    }
                    printModalCtrl.fontWeightKeys = item.fontWeightKeys;
                    printModalCtrl.fontWeightValues = item.fontWeightValues;
                    printModalCtrl.fontUnderlineKeys = item.fontUnderlineKeys;
                    printModalCtrl.textHasBorder = item.textHasBorder;
                    printModalCtrl.borderStyle = item.borderStyle;
                    printModalCtrl.fontUnderlineValues = item.fontUnderlineValues;


                    printModalCtrl.fontItalicKeys = item.fontItalicKeys;
                    printModalCtrl.noTitleKeys = item.noTitleKeys;
                    if (!item.fontSizeValues) {
                        printModalCtrl.fontSizeValues = printModalCtrl.defaultfontSize;
                    }
                    else {
                        printModalCtrl.fontSizeValues = item.fontSizeValues;
                    }
                    if (!item.numberOfRowsValues) {
                        printModalCtrl.numberOfRowsValues = printModalCtrl.defaultNumberOfRowsValues;
                    }
                    else {
                        printModalCtrl.numberOfRowsValues = item.numberOfRowsValues;
                    }
                    if (!item.numberOfColsValues) {
                        printModalCtrl.numberOfColsValues = printModalCtrl.defaultNumberOfColsValues;
                    }
                    else {
                        printModalCtrl.numberOfColsValues = item.numberOfColsValues;
                    }
                    if (!item.startFromRowValues) {
                        printModalCtrl.startFromRowValues = printModalCtrl.defaultstartFromRow;
                    }
                    else {
                        if (item.startFromRowValues == 0) {
                            printModalCtrl.startFromRowValues = 0;
                        }
                        else {
                            printModalCtrl.startFromRowValues = item.startFromRowValues;
                        }
                    }

                    printModalCtrl.fontUnderlineValues = item.fontUnderlineValues;
                    printModalCtrl.fontItalicValues = item.fontItalicValues;

                    if (!item.backgroundColorValues) {
                        printModalCtrl.backgroundColorValues = printModalCtrl.defaultbackgroundColor;
                    }
                    else {
                        printModalCtrl.backgroundColorValues = item.backgroundColorValues;
                    }
                    if (!item.fontColorValues) {
                        printModalCtrl.fontColorValues = printModalCtrl.defaultfontColor;
                    }
                    else {
                        printModalCtrl.fontColorValues = item.fontColorValues;
                    }
                    if (item.staticTextDirection) {
                        printModalCtrl.staticTextDirection = item.staticTextDirection;
                    }
                    else {
                        printModalCtrl.staticTextDirection = "ltr";
                    }

                    printModalCtrl.cellKeyHeight = item.cellKeyHeight;
                    printModalCtrl.cellValueHeight = item.cellValueHeight;
                    printModalCtrl.cellValueWidth = item.cellValueWidth;
                    printModalCtrl.cellKeyWidth = item.cellKeyWidth;

                    if (item.currentFileID)
                        printModalCtrl.currentFileID = item.currentFileID;
                    /*TODO*/
                    printModalCtrl.staticContent = item.staticContent;
                    printModalCtrl.staticText = item.staticText;
                    if (!item.barcode) {
                        item.barcode = {};
                        item.barcode.barcodeStringType = true;
                    }

                    printModalCtrl.barcode = item.barcode;
                    printModalCtrl.barcodeType = item.barcodeType;
                    printModalCtrl.qrcode = item.qrcode;
                    printModalCtrl.qrcodeType = item.qrcodeType;
                    printModalCtrl.currentImageDiagramType = item.currentImageDiagramType;


                    if (printModalCtrl.typeContent == 'table') {
                        if (item.currentTable) {
                            if (!item.currentTable.table) {
                                printModalCtrl.currentTable = _.find(printModalCtrl.tables, {"table": item.currentTable});

                            }
                            else if (item.currentTable.table) {
                                printModalCtrl.currentTable = _.find(printModalCtrl.tables, {"table": item.currentTable.table});
                            }
                            if (printModalCtrl.currentTable) {
                                printModalCtrl.currentFields = [];
                                printModalCtrl.currentFieldsModified = [];
                                for (var r = 0; r < item.currentFields.length; r++) {
                                    var tempCurrentField = _.find(printModalCtrl.currentTable.fields, {"Name": item.currentFields[r].Name});
                                    if (tempCurrentField) {
                                        printModalCtrl.currentFields.push(tempCurrentField);
                                        var copyTempCurrentField = angular.copy(tempCurrentField);
                                        copyTempCurrentField.cellWidth = item.currentFields[r].cellWidth;
                                        copyTempCurrentField.dir = item.currentFields[r].dir;
                                        copyTempCurrentField.tdir = item.currentFields[r].tdir;
                                        printModalCtrl.currentFieldsModified.push(copyTempCurrentField);
                                    }
                                }

                            }

                        }
                    }
                    else if (printModalCtrl.typeContent == 'barcode' || printModalCtrl.typeContent == 'qrcode') {
                        if (item.currentTable && !item.currentTable.table) {
                            printModalCtrl.currentTable = _.find(printModalCtrl.tables, {"table": item.currentTable});
                            if (printModalCtrl.currentTable) {
                                printModalCtrl.currentFields = _.find(printModalCtrl.currentTable.fields, {"Name": item.currentFields.Name});
                            }
                        }
                        else if (item.currentTable && item.currentTable.table) {
                            printModalCtrl.currentTable = _.find(printModalCtrl.tables, {"table": item.currentTable.table});
                            if (printModalCtrl.currentTable) {
                                printModalCtrl.currentFields = _.find(printModalCtrl.currentTable.fields, {"Name": item.currentFields.Name});
                            }
                        }
                    }

                    printModalCtrl.style = item.style;
                    // printModalCtrl.Label = _.find(currentTypeValue.Labels, {"LabelID": item.Label});

                    if (item.LabelTable && item.LabelTableField) {
                        //   printModalCtrl.LabelTableField = _.find(printModalCtrl.Label.Labelfields, {"LabelFieldID": item.Labelfields});

                        printModalCtrl.LabelTable = _.find(printModalCtrl.Label.TableFields, {"Tbl": item.LabelTable});
                        printModalCtrl.LabelTableField = _.find(printModalCtrl.LabelTable.fields, {"Name": item.LabelTableField.Name});
                        // printModalCtrl.LabelTableField = item.LabelTableField;
                    }
                    printModalCtrl.labelClicked = function () {
                        if (printModalCtrl.typeContent == 'dynamicfield') {

                        }
                        else if (printModalCtrl.typeContent == 'staticfield') {

                        }

                    };


                    printModalCtrl.onImageChange = function (files) {

                        if (files[0] == undefined) {
                            printModalCtrl.showImage = true;
                            return;
                        }

                        // if (files[0].$ngfHeight > 400 || files[0].$ngfWidth > 400) {
                        printModalCtrl.showImage = true;
                        //     return;
                        // }
                        // else {
                        //     printModalCtrl.showCaregiverImage = false;
                        // }

                        // Upload.upload({
                        //     url: files[0].name,
                        //     data: {file: files[0]},
                        //     headers: {'x-access-token': $sessionStorage.userAuthenticated.accessToken}
                        // }).then(function (resp) {
                        //     printModalCtrl.PictureLink = resp.data.url
                        // }, function (resp) {
                        //     console.log('Error status: ' + resp.status);
                        // }, function (evt) {
                        //     var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                        //     console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
                        // });
                    };
                    printModalCtrl.staticFieldClicked = function (staticContent) {
                        printModalCtrl.currentImageDiagramType = undefined;
                        printModalCtrl.currentFileID = undefined;
                        printModalCtrl.staticText = undefined;
                        printModalCtrl.staticDateNow = new Date();
                        printModalCtrl.clearFields();

                    };

                    printModalCtrl.updateBarcodeAlign = function (align) {
                        printModalCtrl.barcode.textalign = align;
                        $('.barcodeDisplay1').removeClass('barcodeDisplayActive');
                        $('.barcodeDisplay2').removeClass('barcodeDisplayActive');
                        $('.barcodeDisplay3').removeClass('barcodeDisplayActive');

                        if (align == 'left') {
                            $('.barcodeDisplay1').addClass('barcodeDisplayActive');
                        }
                        else if (align == 'center') {
                            $('.barcodeDisplay2').addClass('barcodeDisplayActive');
                        }
                        else {
                            $('.barcodeDisplay3').addClass('barcodeDisplayActive');
                        }
                        printModalCtrl.generateBarcode();
                    };

                    printModalCtrl.clearFields = function () {

                        printModalCtrl.staticText = null;
                        printModalCtrl.backgroundColor = printModalCtrl.defaultbackgroundColor;
                        printModalCtrl.fontColor = printModalCtrl.defaultfontColor;
                        printModalCtrl.fontSize = printModalCtrl.defaultfontSize;
                        printModalCtrl.valuesbackgroundColor = printModalCtrl.defaultbackgroundColor;
                        printModalCtrl.valuesfontColor = printModalCtrl.defaultfontColor;
                        printModalCtrl.valuesfontSize = printModalCtrl.defaultfontSize;
                        printModalCtrl.fontWeightKeys = null;
                        printModalCtrl.fontUnderlineKeys = null;
                        printModalCtrl.textHasBorder = 'true';
                        printModalCtrl.borderStyle = 'solid';
                        printModalCtrl.fontUnderlineValues = null;
                        printModalCtrl.currentFieldsModified = null;
                        printModalCtrl.cellKeyHeight = null;
                        printModalCtrl.cellValueHeight = null;
                        printModalCtrl.cellKeyWidth = null;
                        printModalCtrl.cellValueWidth = null;
                        if (printModalCtrl.templateDir)
                            printModalCtrl.dir = printModalCtrl.defaultDir;
                        printModalCtrl.tdir = printModalCtrl.defaultDir;

                        printModalCtrl.fontItalicKeys = null;
                        printModalCtrl.noTitleKeys = null;
                        printModalCtrl.fontWeightValues = null;
                        printModalCtrl.fontSizeValues = printModalCtrl.defaultfontSize;
                        printModalCtrl.fontUnderlineValues = null;
                        printModalCtrl.fontItalicValues = null;
                        printModalCtrl.backgroundColorValues = printModalCtrl.defaultbackgroundColor;
                        printModalCtrl.fontColorValues = printModalCtrl.defaultfontColor;
                        printModalCtrl.staticTextDirection = "ltr";

                        printModalCtrl.numberOfRowsValues = printModalCtrl.defaultNumberOfRowsValues;
                        printModalCtrl.numberOfColsValues = printModalCtrl.defaultNumberOfColsValues;
                        printModalCtrl.startFromRowValues = printModalCtrl.defaultstartFromRow;
                    };

                    printModalCtrl.resetBarcodeInput = function (init) {

                        var format = printModalCtrl.barcode.format;
                        var maxStandardLength = PRINT_CONSTANTS.barcodeStringLength;
                        if (!init)
                            delete printModalCtrl.barcode.text;
                        switch (format) {
                            case "CODE128":
                                printModalCtrl.inputMaxlength = maxStandardLength;
                                printModalCtrl.inputMinlength = 1;
                                printModalCtrl.barcodeInputType = "text";
                                printModalCtrl.barcode.barcodeStringType = true;
                                printModalCtrl.barcode.message = null;
                                break;
                            case "CODE128A":
                                printModalCtrl.barcodeInputType = "number";
                                printModalCtrl.inputMaxlength = maxStandardLength;
                                printModalCtrl.inputMinlength = 1;
                                printModalCtrl.barcode.barcodeStringType = false;
                                printModalCtrl.barcode.message = $filter('translate')("ENTER_DIGITS_ONLY") + ' ,' + $filter('translate')("EXCEPT_LEADING_ZEROS");
                                break;
                            case "CODE128B":
                                printModalCtrl.inputMaxlength = maxStandardLength;
                                printModalCtrl.inputMinlength = 1;
                                printModalCtrl.barcode.barcodeStringType = true;
                                printModalCtrl.barcodeInputType = "text";
                                printModalCtrl.barcode.message = null;
                                break;
                            case "CODE128C":
                                printModalCtrl.barcodeInputType = "number";
                                printModalCtrl.inputMaxlength = maxStandardLength;
                                printModalCtrl.inputMinlength = 1;
                                printModalCtrl.barcode.barcodeStringType = false;
                                printModalCtrl.barcode.message = $filter('translate')("ENTER_DIGITS_ONLY") + ' ,' + $filter('translate')("EXCEPT_LEADING_ZEROS");

                                break;
                            case "ITF14":
                                printModalCtrl.barcodeInputType = "number";
                                printModalCtrl.inputMaxlength = 13;
                                printModalCtrl.inputMinlength = 13;
                                printModalCtrl.barcode.barcodeStringType = false;
                                printModalCtrl.barcode.message = $filter('translate')("ENTER_13_DIGITS_ONLY") + ' ,' + $filter('translate')("EXCEPT_LEADING_ZEROS");
                                break;
                            case "MSI":
                                printModalCtrl.barcodeInputType = "number";
                                printModalCtrl.inputMaxlength = 13;
                                printModalCtrl.inputMinlength = 1;
                                printModalCtrl.barcode.barcodeStringType = false;
                                printModalCtrl.barcode.message = $filter('translate')("ENTER_MAX_13_DIGITS_ONLY") + ' ,' + $filter('translate')("EXCEPT_LEADING_ZEROS");
                                break;
                            case "msi10":
                                printModalCtrl.barcodeInputType = "number";
                                printModalCtrl.inputMaxlength = maxStandardLength;
                                printModalCtrl.inputMinlength = 1;
                                printModalCtrl.barcode.barcodeStringType = false;
                                printModalCtrl.barcode.message = $filter('translate')("ENTER_DIGITS_ONLY") + ' ,' + $filter('translate')("EXCEPT_LEADING_ZEROS");
                                break;
                            case "MSI11":
                                printModalCtrl.barcodeInputType = "number";
                                printModalCtrl.inputMaxlength = maxStandardLength;
                                printModalCtrl.inputMinlength = 1;
                                printModalCtrl.barcode.barcodeStringType = false;
                                printModalCtrl.barcode.message = $filter('translate')("ENTER_DIGITS_ONLY") + ' ,' + $filter('translate')("EXCEPT_LEADING_ZEROS");
                                break;
                            case "MSI1010":
                                printModalCtrl.barcodeInputType = "number";
                                printModalCtrl.inputMaxlength = maxStandardLength;
                                printModalCtrl.inputMinlength = 1;
                                printModalCtrl.barcode.barcodeStringType = false;
                                printModalCtrl.barcode.message = $filter('translate')("ENTER_DIGITS_ONLY") + ' ,' + $filter('translate')("EXCEPT_LEADING_ZEROS");
                                break;
                            case "MSI1110":
                                printModalCtrl.barcodeInputType = "number";
                                printModalCtrl.inputMaxlength = maxStandardLength;
                                printModalCtrl.inputMinlength = 1;
                                printModalCtrl.barcode.barcodeStringType = false;
                                printModalCtrl.barcode.message = $filter('translate')("ENTER_DIGITS_ONLY") + ' ,' + $filter('translate')("EXCEPT_LEADING_ZEROS");
                                break;
                            case "pharmacode":
                                printModalCtrl.barcodeInputType = "number";
                                printModalCtrl.inputMaxlength = 5;
                                printModalCtrl.inputMinlength = 2;
                                printModalCtrl.barcode.barcodeStringType = false;
                                printModalCtrl.barcode.message = $filter('translate')("ENTER_2-5_DIGITS") + ' ,' + $filter('translate')("EXCEPT_LEADING_ZEROS");
                                break;
                            case "codabar":
                                printModalCtrl.barcodeInputType = "number";
                                printModalCtrl.inputMaxlength = maxStandardLength;
                                printModalCtrl.inputMinlength = 1;
                                printModalCtrl.barcode.barcodeStringType = false;
                                printModalCtrl.barcode.message = $filter('translate')("ENTER_DIGITS_ONLY") + ' ,' + $filter('translate')("EXCEPT_LEADING_ZEROS");
                                break;
                            case "EAN2":
                                printModalCtrl.barcodeInputType = "number";
                                printModalCtrl.inputMaxlength = 2;
                                printModalCtrl.inputMinlength = 2;
                                printModalCtrl.barcode.barcodeStringType = false;
                                printModalCtrl.barcode.message = $filter('translate')("ENTER_2_DIGITS") + ' ,' + $filter('translate')("EXCEPT_LEADING_ZEROS");
                                break;

                            case "EAN5":
                                printModalCtrl.barcodeInputType = "number";
                                printModalCtrl.inputMaxlength = 5;
                                printModalCtrl.inputMinlength = 5;
                                printModalCtrl.barcode.barcodeStringType = false;
                                printModalCtrl.barcode.message = $filter('translate')("ENTER_5_DIGITS") + ' ,' + $filter('translate')("EXCEPT_LEADING_ZEROS");
                                break;

                            case "EAN8":
                                printModalCtrl.barcodeInputType = "number";
                                printModalCtrl.inputMaxlength = 7;
                                printModalCtrl.inputMinlength = 7;
                                printModalCtrl.barcode.barcodeStringType = false;
                                printModalCtrl.barcode.message = $filter('translate')("ENTER_7_DIGITS") + ' ,' + $filter('translate')("EXCEPT_LEADING_ZEROS");
                                break;
                            case "EAN13":
                                printModalCtrl.barcodeInputType = "number";
                                printModalCtrl.inputMaxlength = 12;
                                printModalCtrl.inputMinlength = 12;
                                printModalCtrl.barcode.barcodeStringType = false;
                                printModalCtrl.barcode.message = $filter('translate')("ENTER_12_DIGITS") + ' ,' + $filter('translate')("EXCEPT_LEADING_ZEROS");
                                break;
                            case "CODE39":
                                printModalCtrl.barcodeInputType = "text";
                                printModalCtrl.inputMaxlength = maxStandardLength;
                                printModalCtrl.inputMinlength = 1;
                                printModalCtrl.barcode.barcodeStringType = true;
                                printModalCtrl.barcode.message = undefined;
                                break;

                            // case "MSI10":
                            //     printModalCtrl.barcodeInputType = "number";
                            //     printModalCtrl.inputMaxlength = maxStandardLength;
                            //     printModalCtrl.barcode.barcodeStringType = false;
                            //     printModalCtrl.barcode.message = $filter('translate')("ENTER_DIGITS_ONLY");
                            //     break;
                        }
                        printModalCtrl.showBarcode = false;
                    };

                    printModalCtrl.generateBarcode = function (typeChanged, isnumber, istrue) {
                        printModalCtrl.showBarcodeErrorMessage = false;
                        if (printModalCtrl.barcode && printModalCtrl.barcode.text && printModalCtrl.barcode.text.length == 0) {
                            printModalCtrl.showBarcodeErrorMessage = true;
                        }

                        printModalCtrl.barcodeInputIsNotValid = false;
                        if (istrue) {
                            printModalCtrl.resetBarcodeInput(true);
                        }

                        if (typeChanged == true) {
                            printModalCtrl.resetBarcodeInput();
                        }

                        else {
                            if (isnumber) {

                                while (printModalCtrl.barcode.text.toString().substring(0, 1) == "0") {
                                    printModalCtrl.barcode.text = printModalCtrl.barcode.text.toString().substr(1);
                                }
                                var filterInput = document.getElementById("barcodeInput");
                                if (filterInput) {
                                    filterInput.addEventListener("keydown", function (e) {

                                        // prevent: "e", "=", ",", "-", "."
                                        if ([69, 187, 188, 189, 190].includes(e.keyCode)) {
                                            e.preventDefault();
                                        }

                                        // else{
                                        //     e.preventDefault();
                                        // }
                                    })
                                }
                            }
                            if (printModalCtrl.barcode && !printModalCtrl.barcode.text) {
                                printModalCtrl.showBarcode = false;
                                //  printModalCtrl.inputMaxlength = 20;
                            }
                            else {
                                if (printModalCtrl.barcode.text
                                    && printModalCtrl.inputMinlength <= printModalCtrl.barcode.text.toString().length
                                    && printModalCtrl.inputMaxlength >= printModalCtrl.barcode.text.toString().length) {
                                    printModalCtrl.showBarcode = true;
                                }
                                else {
                                    printModalCtrl.showBarcode = false
                                }
                            }
                        }

                        if (printModalCtrl.showBarcode && printModalCtrl.barcode) {
                            $timeout(function () {
                                JsBarcode("#barcode", printModalCtrl.barcode.text, {
                                    fontSize: printModalCtrl.barcode.fontSize,
                                    format: printModalCtrl.barcode.format,
                                    lineColor: printModalCtrl.barcode.lineColor,
                                    width: printModalCtrl.barcode.width,
                                    height: printModalCtrl.barcode.height,
                                    displayValue: printModalCtrl.barcode.displayvalue,
                                    textAlign: printModalCtrl.barcode.textalign,
                                    textPosition: printModalCtrl.barcode.textposition,
                                    font: printModalCtrl.barcode.font,
                                    textMargin: printModalCtrl.barcode.textmargin,
                                    background: printModalCtrl.barcode.background,
                                    // fontOptions: printModalCtrl.barcode.fontoptions

                                })

                            });
                        }
                        //"#0aa"
                    };

                    printModalCtrl.viewBarcodeInput = function () {

                        if (printModalCtrl.barcode && printModalCtrl.barcode.format) {
                            if (!printModalCtrl.barcode.text)
                                printModalCtrl.barcode.text = "";
                            switch (printModalCtrl.barcode.format) {
                                case "CODE128":
                                    printModalCtrl.barcode.message = null;
                                    break;
                                case "CODE128A":
                                    printModalCtrl.barcode.message = $filter('translate')("ENTER_DIGITS_ONLY") + ' ,' + $filter('translate')("EXCEPT_LEADING_ZEROS");
                                    break;
                                case "CODE128B":
                                    printModalCtrl.barcode.message = null;
                                    break;
                                case "CODE128C":
                                    printModalCtrl.barcode.message = $filter('translate')("ENTER_DIGITS_ONLY") + ' ,' + $filter('translate')("EXCEPT_LEADING_ZEROS");

                                    break;
                                case "ITF14":
                                    printModalCtrl.barcode.message = $filter('translate')("ENTER_13_DIGITS_ONLY") + ' ,' + $filter('translate')("EXCEPT_LEADING_ZEROS");
                                    break;
                                case "MSI":
                                    printModalCtrl.barcode.message = $filter('translate')("ENTER_MAX_13_DIGITS_ONLY") + ' ,' + $filter('translate')("EXCEPT_LEADING_ZEROS");
                                    break;
                                case "msi10":
                                    printModalCtrl.barcode.message = $filter('translate')("ENTER_DIGITS_ONLY") + ' ,' + $filter('translate')("EXCEPT_LEADING_ZEROS");
                                    break;
                                case "MSI11":
                                    printModalCtrl.barcode.message = $filter('translate')("ENTER_DIGITS_ONLY") + ' ,' + $filter('translate')("EXCEPT_LEADING_ZEROS");
                                    break;
                                case "MSI1010":
                                    printModalCtrl.barcode.message = $filter('translate')("ENTER_DIGITS_ONLY") + ' ,' + $filter('translate')("EXCEPT_LEADING_ZEROS");
                                    break;
                                case "MSI1110":
                                    printModalCtrl.barcode.message = $filter('translate')("ENTER_DIGITS_ONLY") + ' ,' + $filter('translate')("EXCEPT_LEADING_ZEROS");
                                    break;
                                case "pharmacode":
                                    printModalCtrl.barcode.message = $filter('translate')("ENTER_2-5_DIGITS") + ' ,' + $filter('translate')("EXCEPT_LEADING_ZEROS");
                                    break;
                                case "codabar":
                                    printModalCtrl.barcode.message = $filter('translate')("ENTER_DIGITS_ONLY") + ' ,' + $filter('translate')("EXCEPT_LEADING_ZEROS");
                                    break;
                                case "EAN2":
                                    printModalCtrl.barcode.message = $filter('translate')("ENTER_2_DIGITS") + ' ,' + $filter('translate')("EXCEPT_LEADING_ZEROS");
                                    break;

                                case "EAN5":
                                    printModalCtrl.barcode.message = $filter('translate')("ENTER_5_DIGITS") + ' ,' + $filter('translate')("EXCEPT_LEADING_ZEROS");
                                    break;

                                case "EAN8":
                                    printModalCtrl.barcode.message = $filter('translate')("ENTER_7_DIGITS") + ' ,' + $filter('translate')("EXCEPT_LEADING_ZEROS");
                                    break;
                                case "EAN13":
                                    printModalCtrl.barcode.message = $filter('translate')("ENTER_12_DIGITS") + ' ,' + $filter('translate')("EXCEPT_LEADING_ZEROS");
                                    break;
                                case "CODE39":
                                    printModalCtrl.barcode.message = null;
                                    break;
                                // case "MSI10":
                                //     printModalCtrl.barcode.message = $filter('translate')("ENTER_DIGITS_ONLY");
                                //     break;
                            }
                        }
                    };

                    printModalCtrl.generateBarcode(null, null, true);
                    printModalCtrl.viewBarcodeInput();
                    // printModalCtrl.typeContentClicked();

                    printModalCtrl.exit = function () {
                        $modalInstance.close('exit');
                    };

                    // printModalCtrl.cellKeyHeightClicked = function (iskey) {
                    //     if (iskey) {
                    //         printModalCtrl.LabelTableField.cellValueHeight = 100 - printModalCtrl.LabelTableField.cellKeyHeight;
                    //     }
                    //     else {
                    //         printModalCtrl.LabelTableField.cellKeyHeight = 100 - printModalCtrl.LabelTableField.cellValueHeight;
                    //     }
                    // };
                    // printModalCtrl.cellKeyWidthClicked = function (iskey) {
                    //     if (iskey) {
                    //         printModalCtrl.LabelTableField.cellValueWidth = 100 - printModalCtrl.LabelTableField.cellKeyWidth;
                    //     }
                    //     else {
                    //         printModalCtrl.LabelTableField.cellKeyWidth = 100 - printModalCtrl.LabelTableField.cellValueWidth;
                    //     }
                    // };
                    // printModalCtrl.resetWidthAndHight = function () {
                    //     printModalCtrl.LabelTableField.cellKeyWidth = 50;
                    //     printModalCtrl.LabelTableField.cellValueWidth = 50;
                    //     printModalCtrl.LabelTableField.cellKeyHeight = 50;
                    //     printModalCtrl.LabelTableField.cellValueHeight = 50;
                    //
                    // }

                    printModalCtrl.updateWidget = function () {
                        var item = {};
                        item.typeContent = printModalCtrl.typeContent;
                        item.staticContent = printModalCtrl.staticContent;
                        if (printModalCtrl.typeContent == 'blanktable' || printModalCtrl.typeContent == 'table' || (printModalCtrl.typeContent == 'staticfield' && (printModalCtrl.staticContent == "text" || printModalCtrl.arrayOfDates.indexOf(printModalCtrl.staticContent) !== -1)) || (printModalCtrl.typeContent == 'staticfield' && printModalCtrl.staticContent == "date")) {
                            item.fontColor = printModalCtrl.fontColor;
                            item.dir = printModalCtrl.dir;
                            item.tdir = printModalCtrl.tdir;
                            item.backgroundColor = printModalCtrl.backgroundColor;
                            item.fontSize = printModalCtrl.fontSize;
                            item.fontWeightKeys = printModalCtrl.fontWeightKeys;
                            item.fontWeightValues = printModalCtrl.fontWeightValues;
                            item.fontUnderlineKeys = printModalCtrl.fontUnderlineKeys;
                            item.textHasBorder = printModalCtrl.textHasBorder;
                            item.borderStyle = printModalCtrl.borderStyle;
                            item.fontUnderlineValues = printModalCtrl.fontUnderlineValues;
                            item.fontItalicKeys = printModalCtrl.fontItalicKeys;
                            item.noTitleKeys = printModalCtrl.noTitleKeys;
                            item.fontSizeValues = printModalCtrl.fontSizeValues;
                            item.fontItalicValues = printModalCtrl.fontItalicValues;
                            item.backgroundColorValues = printModalCtrl.backgroundColorValues;
                            item.fontColorValues = printModalCtrl.fontColorValues;
                            item.numberOfRowsValues = printModalCtrl.numberOfRowsValues;
                            item.numberOfColsValues = printModalCtrl.numberOfColsValues;
                            item.startFromRowValues = printModalCtrl.startFromRowValues;
                            item.staticTextDirection = printModalCtrl.staticTextDirection;
                        }
                        if (printModalCtrl.typeContent == 'table' || printModalCtrl.typeContent == 'barcode' || printModalCtrl.typeContent == 'qrcode') {
                            if (printModalCtrl.currentTypeValue) {
                                item.currentTypeValue = printModalCtrl.currentTypeValue.ObjectTypeID;
                            }
                            item.currentTable = printModalCtrl.currentTable;

                            item.tables = printModalCtrl.tables;
                            item.currentObjectType = printModalCtrl.currentObjectType;
                            item.printFields = printModalCtrl.printFields;
                            if (printModalCtrl.typeContent == 'table') {
                                printModalCtrl.fields = [];
                                for (var i = 0; i < printModalCtrl.currentFieldsModified.length; i++) {
                                    printModalCtrl.fields.push({
                                        "Name": printModalCtrl.currentFieldsModified[i].Name,
                                        "cellWidth": printModalCtrl.currentFieldsModified[i].cellWidth,
                                        "LName": printModalCtrl.currentFieldsModified[i].LName,
                                        "EName": printModalCtrl.currentFieldsModified[i].EName,
                                        "CriteriaFieldName": printModalCtrl.currentFields[i].CriteriaFieldName,
                                        "dir": printModalCtrl.currentFieldsModified[i].dir,
                                        "tdir": printModalCtrl.currentFieldsModified[i].tdir,
                                        "ObjectCriteriaFieldName": printModalCtrl.currentFields[i].ObjectCriteriaFieldName
                                    });
                                }
                                item.currentFields = printModalCtrl.fields;
                            }
                            else if (printModalCtrl.typeContent == 'barcode') {
                                item.currentFields = printModalCtrl.currentFields;
                                item.barcode = printModalCtrl.barcode;
                                item.barcodeType = printModalCtrl.barcodeType;

                            }
                            else if (printModalCtrl.typeContent == 'qrcode') {
                                item.currentFields = printModalCtrl.currentFields;
                                item.qrcode = printModalCtrl.qrcode;
                                item.qrcodeType = printModalCtrl.qrcodeType;

                            }

                        }
                        else if (printModalCtrl.typeContent == 'dynamicfield') {
                            // printModalCtrl.label = {};
                            // item.Label = printModalCtrl.Label;
                            // item.Labelfields = printModalCtrl.LabelTableField;
                            // item.currentTypeValue = printModalCtrl.currentTypeValue;
                            if (printModalCtrl.contentType.type == 'label') {
                                if (printModalCtrl.LabelTableField) {
                                    item.LabelTable = printModalCtrl.LabelTable.Tbl;
                                    item.LabelTableField = printModalCtrl.LabelTableField;
                                    // item.ObjectTypeID = printModalCtrl.LabelTableField;
                                    // item.Labelfields = printModalCtrl.LabelTableField.LabelFieldID;
                                    // item.EName = printModalCtrl.LabelTableField.EName;
                                    // item.LName = printModalCtrl.LabelTableField.LName;
                                    item.style = printModalCtrl.style;
                                    item.cellKeyHeight = printModalCtrl.cellKeyHeight;
                                    item.cellValueHeight = printModalCtrl.cellValueHeight;
                                    item.cellValueWidth = printModalCtrl.cellValueWidth;
                                    item.cellKeyWidth = printModalCtrl.cellKeyWidth;
                                    item.fontColor = printModalCtrl.fontColor;
                                    item.fontColorValues = printModalCtrl.fontColorValues;
                                    item.dir = printModalCtrl.dir;
                                    item.tdir = printModalCtrl.tdir;
                                    item.backgroundColor = printModalCtrl.backgroundColor;
                                    item.backgroundColorValues = printModalCtrl.backgroundColorValues;
                                    item.fontSize = printModalCtrl.fontSize;
                                    item.fontSizeValues = printModalCtrl.fontSizeValues;
                                    item.fontWeightKeys = printModalCtrl.fontWeightKeys;
                                    item.fontWeightValues = printModalCtrl.fontWeightValues;
                                    item.fontUnderlineKeys = printModalCtrl.fontUnderlineKeys;
                                    item.fontUnderlineValues = printModalCtrl.fontUnderlineValues;
                                    item.fontItalicKeys = printModalCtrl.fontItalicKeys;
                                    item.noTitleKeys = printModalCtrl.noTitleKeys;
                                    item.fontItalicValues = printModalCtrl.fontItalicValues;
                                }
                                // item.TemplateOptionID = printModalCtrl.currentTypeValue.TemplateOptionID;
                            }
                        }
                        else if (printModalCtrl.typeContent == "staticfield") {

                            if (printModalCtrl.staticContent == "file") {
                                item.currentFileID = printModalCtrl.currentFileID;
                            }
                            else if (printModalCtrl.staticContent == "diagram") {
                                item.currentImageDiagramType = printModalCtrl.currentImageDiagramType;
                            }
                            else if (printModalCtrl.staticContent == "image") {
                                item.currentImageDiagramType = printModalCtrl.currentImageDiagramType;

                            }
                            else if (printModalCtrl.staticContent == "text") {
                                item.staticText = printModalCtrl.staticText;
                            }
                            else if (printModalCtrl.staticContent == "date") {

                            }
                        }
                        $modalInstance.close(item);
                    };

                    printModalCtrl.selectPosition = function (headerordata, index) {
                        if (headerordata == 'headers') {

                        }
                        else {

                        }
                        printModalCtrl.selectedPosition = index;
                    };


                    printModalCtrl.initTableAlign = function () {

                    };

                    printModalCtrl.clearTable = function () {

                    };

                    printModalCtrl.initTablePercent = function () {
                        var onSampleResized = function (e) {

                            var table = $(e.currentTarget);
                            if (printModalCtrl.typeContent == 'table') {   //reference to the resized table
                                for (var i = 0; i < table.contents().find('th').length / 2; i++) {
                                    printModalCtrl.currentFieldsModified[i].cellWidth = $(e.currentTarget).contents().find('th')[i].offsetWidth / $(e.currentTarget)[0].offsetWidth;
                                    printModalCtrl.currentFieldsModified[i].cellWidth *= 100;
                                }
                            }
                            else {
                                if (printModalCtrl.style == 'horizontal') {
                                    printModalCtrl.cellKeyWidth = $(e.currentTarget).contents().find('th')[0].offsetWidth / $(e.currentTarget)[0].offsetWidth;
                                    printModalCtrl.cellKeyWidth *= 100;
                                    printModalCtrl.cellValueWidth = 100 - printModalCtrl.cellKeyWidth;

                                }
                            }
                        };
                        $(".tablez").colResizable({disable: true});
                        $timeout(function () {
                            $(".tablez").colResizable({
                                liveDrag: true,
                                gripInnerHtml: "<div class='grip'></div>",
                                draggingClass: "dragging",
                                onResize: onSampleResized
                                // onDrag: function() {
                                // //trigger a resize event, so paren-witdh directive will be updated
                                //     $(window).trigger('resize');
                                // }

                            });
                            // $scope.$apply();
                        }, 1000);
                    };

                    printModalCtrl.initHorizontalPercent = function () {

                        var onSampleResized1 = function (e) {
                            var table = $(e.currentTarget); //reference to the resized table
                            for (var i = 0; i < table.contents().find('th').length / 2; i++) {
                                printModalCtrl.currentFieldsModified[i].cellWidth = $(e.currentTarget).contents().find('th')[i].offsetWidth / $(e.currentTarget)[0].offsetWidth;
                                printModalCtrl.currentFieldsModified[i].cellWidth *= 100;
                            }
                        };
                        $timeout(function () {
                            $(".horizontalz").colResizable({
                                liveDrag: true
                                // ,
                                // gripInnerHtml:"<div class='grip'></div>",
                                // draggingClass:"dragging",
                                // onResize:onSampleResized1
                                // onDrag: function() {
                                // //trigger a resize event, so paren-witdh directive will be updated
                                //     $(window).trigger('resize');
                                // }

                            });
                        }, 1000);
                    };

                    printModalCtrl.AddNewItem = function () {
                        var modalInstance = $modal.open({
                            templateUrl: 'views/common/mainContentTemplate.html',
                            controller: function ($scope, $compile, $modalInstance, commonFunctions) {

                                $scope.reportID = 351;
                                $scope.pageDisplay = 0;
                                $scope.returnValue = true;
                                $scope.onlyNewTab = true;
                                $scope.modal = true;
                                $scope.showBreadCrumb = false;
                                $scope.multiSelect = false;
                                commonFunctions.commonCodeSearch($scope);
                                $scope.getDisplayReportSearchFields();
                                $scope.ok = function () {
                                    $modalInstance.close();
                                };

                                $scope.rowClicked = function (id, formID, fieldName) {
                                    $modalInstance.close(id);
                                }
                            },
                            resolve: {
                                reportID: function () {
                                    return 351;
                                }
                            }
                        }).result.then(function (ID) {
                            printModalCtrl.currentFileID = ID;
                        });
                    };

                    printModalCtrl.differencesBetweenArrays = function (arr1, arr2) {
                        var intesectArray = arr2;
                        if (intesectArray && intesectArray.length > 0) {
                            intesectArray = _.forEach(arr1, function (row) {

                                var temp = _.find(intesectArray, {"Name": row.Name});
                                if (!temp) {
                                    intesectArray.push(row);
                                }
                                return intesectArray;
                            })
                        }
                        return intesectArray;
                    };

                    printModalCtrl.resetWidthPercentage = function (data) {
                        if (data == 0) {
                            printModalCtrl.currentFields = [];
                            printModalCtrl.currentFieldsModified = [];
                            return;
                        }
                        // printModalCtrl.currentFieldsModified= printModalCtrl.differencesBetweenArrays(printModalCtrl.currentFieldsModified,printModalCtrl.currentFields);
                        printModalCtrl.currentFieldsModified = printModalCtrl.currentFields;


                        // printModalCtrl.currentFieldsModified = angular.copy(printModalCtrl.currentFields);
                        var length = printModalCtrl.currentFieldsModified.length;
                        for (var i = 0; i < length; i++) {
                            printModalCtrl.currentFieldsModified[i].cellWidth = parseFloat((100 / length).toFixed(2));
                            printModalCtrl.currentFieldsModified[i].cellWidthPrev = printModalCtrl.currentFieldsModified[i].cellWidth;
                            if (!printModalCtrl.currentFieldsModified[i].tdir) {
                                printModalCtrl.currentFieldsModified[i].tdir = 'left';
                            }
                            if (!printModalCtrl.currentFieldsModified[i].dir) {
                                printModalCtrl.currentFieldsModified[i].dir = 'left';
                            }
                        }
                        // printModalCtrl.clearFields();
                        //printModalCtrl.initTablePercent();
                    };

                    printModalCtrl.cellKeyHeightClicked = function (iskey) {
                        if (iskey) {
                            printModalCtrl.cellValueHeight = 100 - printModalCtrl.cellKeyHeight;
                        }
                        else {
                            printModalCtrl.cellKeyHeight = 100 - printModalCtrl.cellValueHeight;
                        }
                    };
                    printModalCtrl.cellKeyWidthClicked = function (iskey, index) {
                    //printModalCtrl.currentFieldsModified[$index].cellWidth

                        if (iskey == 'table') {
                            if (!printModalCtrl.currentFieldsModified[index].cellWidth) {
                                printModalCtrl.currentFieldsModified[index].cellWidth = printModalCtrl.currentFieldsModified[index].cellWidthPrev;
                                return;
                            }

                            var sumNext = 0;
                            var sumPrev = 0;
                            for (var i = 0; i < index; i++) {
                                sumPrev += Number(printModalCtrl.currentFieldsModified[i].cellWidth);
                            }
                            if ((printModalCtrl.currentFieldsModified[index].cellWidth > 100 - sumPrev) || (printModalCtrl.currentFieldsModified[index].cellWidth > 100 - printModalCtrl.currentFieldsModified.length + 1)) {
                                printModalCtrl.currentFieldsModified[index].cellWidth = printModalCtrl.currentFieldsModified[index].cellWidthPrev;
                                return;
                            }
                            sumNext = 100 - sumPrev - printModalCtrl.currentFieldsModified[index].cellWidth;
                            printModalCtrl.currentFieldsModified[index].cellWidthPrev = printModalCtrl.currentFieldsModified[index].cellWidth;
                            for (var i = index + 1; i < printModalCtrl.currentFieldsModified.length; i++) {
                                printModalCtrl.currentFieldsModified[i].cellWidth = parseFloat((sumNext / (printModalCtrl.currentFieldsModified.length - index - 1)).toFixed(2));
                                printModalCtrl.currentFieldsModified[i].cellWidthPrev = printModalCtrl.currentFieldsModified[i].cellWidth;
                            }

                            return;
                        }
                        if (iskey) {
                            printModalCtrl.cellValueWidth = 100 - printModalCtrl.cellKeyWidth;
                        }
                        else {
                            printModalCtrl.cellKeyWidth = 100 - printModalCtrl.cellValueWidth;
                        }
                    };
                    printModalCtrl.objectTypeClicked = function () {
                        printModalCtrl.table.tableFields = [];
                        for (var i in printModalCtrl.table.objectType.TableFields) {
                            printModalCtrl.table.tableFields.push({
                                Name: i,
                                Fields: printModalCtrl.table.objectType.TableFields[i]
                            });
                        }
                        // printModalCtrl.table.DataSource = "";
                    };
                    printModalCtrl.creaseWidgetHeight = function (counter) {
                        printModalCtrl.rowHeight += counter;
                    };

                    printModalCtrl.creaseWidgetWidth = function (counter) {
                        printModalCtrl.rowWidth += counter;
                    };

                    printModalCtrl.creaseFontSize = function (counter, values) {
                        if (values) {
                            printModalCtrl.fontSizeValues += counter;
                        }
                        else {
                            printModalCtrl.fontSize += counter;
                        }
                    };

                    printModalCtrl.creasePercentWidth = function (percent) {
                        // printModalCtrl.percentWidth+=percent;
                    };

                    printModalCtrl.creasePartPercent = function (typecontent, index, count) {
                        if (printModalCtrl.currentFieldsModified[index].cellWidth <= 0)
                            return;
                        if (printModalCtrl.currentFieldsModified[index].cellWidth <= 1 && count == -1) {
                            return;
                        }
                        if (printModalCtrl.currentFieldsModified[index].cellWidth > 100 - printModalCtrl.currentFieldsModified.length - 1 && count == 1) {
                            return;
                        }
                        if (typecontent == 'table') {
                            var sumPrev = 0;
                            for (var i = 0; i < index; i++) {
                                sumPrev += printModalCtrl.currentFieldsModified[i].cellWidth;
                            }
                            if (printModalCtrl.currentFieldsModified[index].cellWidth > 100 - sumPrev - printModalCtrl.currentFieldsModified.length - 1 && count == 1) {
                                return;
                            }
                            printModalCtrl.currentFieldsModified[index].cellWidth += count;
                            printModalCtrl.currentFieldsModified[index].cellWidthPrev = printModalCtrl.currentFieldsModified[index].cellWidth;
                            // }
                            var sumNext = 100 - printModalCtrl.currentFieldsModified[index].cellWidth - sumPrev;
                            // sum = 100 - printModalCtrl.currentFieldsModified[index].cellWidth;
                            for (var i = index + 1; i < printModalCtrl.currentFieldsModified.length; i++)
                                printModalCtrl.currentFieldsModified[i].cellWidth = parseFloat((sumNext / (printModalCtrl.currentFieldsModified.length - index - 1)).toFixed(2));
                            // if(printModalCtrl.currentFieldsModified[i])
                            printModalCtrl.currentFieldsModified[i].cellWidthPrev = printModalCtrl.currentFieldsModified[i].cellWidth;

                            // printModalCtrl.currentFieldsModified[index].cellWidth += count;
                            // printModalCtrl.currentFieldsModified[printModalCtrl.currentFieldsModified.length - 1].cellWidth = printModalCtrl.currentFieldsModified[printModalCtrl.currentFieldsModified.length - 1].cellWidth - count;
                        }
                    };

                    printModalCtrl.cellLabelPercent = function (objectType, shape, add, keyValue) {
                        if (objectType == 'label') {
                            if (shape == 'vertical') {
                                if (keyValue == 'key') {
                                    printModalCtrl.cellKeyHeight += add;
                                    printModalCtrl.cellValueHeight = 100 - printModalCtrl.cellKeyHeight;
                                }
                                else if (keyValue == 'value') {
                                    printModalCtrl.cellValueHeight += add;
                                    printModalCtrl.cellKeyHeight = 100 - printModalCtrl.cellValueHeight;
                                }
                            }
                            else if (shape == 'horizontal') {
                                if (keyValue == 'key') {
                                    printModalCtrl.cellKeyWidth += add;
                                    printModalCtrl.cellValueWidth = 100 - printModalCtrl.cellKeyHeight;
                                }
                                else if (keyValue == 'value') {
                                    printModalCtrl.cellValueWidth += add;
                                    printModalCtrl.cellKeyWidth = 100 - printModalCtrl.cellValueWidth;
                                }
                            }
                        }
                    }
                },
                controllerAs: 'printModalCtrl'
            }).result.then(function (result) {
                if (result && result !== 'exit') {
                    $scope.widgets[index].typeContent = result.typeContent;
                    $scope.widgets[index].currentTable = result.currentTable;
                    // $scope.widgets[index].currentFields = result.currentFields;
                    $scope.widgets[index].currentFields = result.currentFields;
                    $scope.widgets[index].staticText = result.staticText;
                    $scope.widgets[index].style = result.style;
                    $scope.widgets[index].fontColor = result.fontColor;
                    $scope.widgets[index].dir = result.dir;
                    $scope.widgets[index].tdir = result.tdir;
                    $scope.widgets[index].backgroundColor = result.backgroundColor;
                    $scope.widgets[index].fontSize = result.fontSize;
                    $scope.widgets[index].fontWeightKeys = result.fontWeightKeys;
                    $scope.widgets[index].staticTextDirection = result.staticTextDirection;
                    $scope.widgets[index].fontUnderlineKeys = result.fontUnderlineKeys;
                    $scope.widgets[index].textHasBorder = result.textHasBorder;
                    $scope.widgets[index].borderStyle = result.borderStyle;
                    $scope.widgets[index].fontItalicKeys = result.fontItalicKeys;
                    $scope.widgets[index].noTitleKeys = result.noTitleKeys;
                    $scope.widgets[index].fontWeightValues = result.fontWeightValues;
                    $scope.widgets[index].fontSizeValues = result.fontSizeValues;
                    $scope.widgets[index].fontUnderlineValues = result.fontUnderlineValues;
                    $scope.widgets[index].fontItalicValues = result.fontItalicValues;
                    $scope.widgets[index].backgroundColorValues = result.backgroundColorValues;
                    $scope.widgets[index].fontColorValues = result.fontColorValues;
                    $scope.widgets[index].numberOfRowsValues = result.numberOfRowsValues;
                    $scope.widgets[index].numberOfColsValues = result.numberOfColsValues;
                    $scope.widgets[index].startFromRowValues = result.startFromRowValues;
                    $scope.widgets[index].startFromColsValues = result.startFromColsValues;
                    $scope.widgets[index].RowsValuesArray = [];

                    if (result.numberOfRowsValues) {
                        for (var d = 0; d <result.numberOfRowsValues; d++) {
                            $scope.widgets[index].RowsValuesArray.push(d);
                        }
                        $scope.widgets[index].tableHeaderHeight = 100 / (result.numberOfRowsValues + 1);
                        $scope.widgets[index].tableBodyHeight = 100 - $scope.widgets[index].tableHeaderHeight;
                    }

                    $scope.widgets[index].typeContent = result.typeContent;
                    $scope.widgets[index].tables = result.tables;
                    $scope.widgets[index].staticContent = result.staticContent;
                    $scope.widgets[index].staticText = result.staticText;
                    $scope.widgets[index].currentTypeValue = result.currentTypeValue;
                    $scope.widgets[index].printFields = result.printFields;
                    $scope.widgets[index].barcode = result.barcode;
                    $scope.widgets[index].barcodeType = result.barcodeType;
                    $scope.widgets[index].qrcode = result.qrcode;
                    $scope.widgets[index].qrcodeType = result.qrcodeType;
                    $scope.widgets[index].currentFileID = result.currentFileID;
                    $scope.widgets[index].currentImageDiagramType = result.currentImageDiagramType;

                    /***
                     * label
                     * */
                    // printModalCtrl.label = {};
                    if (result.typeContent == "dynamicfield" && (result.style == 'horizontal' || result.style == 'vertical')) {
                        $scope.widgets[index].LabelTable = result.LabelTable;
                        $scope.widgets[index].LabelTableField = result.LabelTableField;
                        $scope.widgets[index].EName = result.EName;
                        $scope.widgets[index].LName = result.LName;
                        $scope.widgets[index].style = result.style;
                        $scope.widgets[index].cellKeyHeight = result.cellKeyHeight;
                        $scope.widgets[index].cellValueHeight = result.cellValueHeight;
                        $scope.widgets[index].cellValueWidth = result.cellValueWidth;
                        $scope.widgets[index].cellKeyWidth = result.cellKeyWidth;
                        $scope.widgets[index].TemplateOptionID = result.TemplateOptionID;
                    }

                    if ($scope.widgets && $scope.widgets.length > 0) {
                        for (var i = 0; i < $scope.widgets.length; i++) {
                            if ($scope.widgets[index].typeContent == 'barcode') {
                                $scope.buildBarcode(i, $scope.widgets[i]);
                            }


                        }
                    }
                }
            });

        };

        $scope.removeWidget = function (index) {
            $scope.widgets.splice(index, 1);
            $scope.draweLine();
        };


        $scope.onoffButtons = function () {
            $scope.isvisible = !$scope.isvisible;
        };
        $scope.onoffHeader = function () {
            $scope.isvisible2 = !$scope.isvisible2;
        };
        $scope.onoffFooter = function () {
            $scope.isvisible3 = !$scope.isvisible3;
        };

        // $scope.showWidgets = function () {
        //     $scope.isvisible = false;
        // };
        //
        $scope.addNewPage = function () {
            var maxy = 1;
            for (var i = 0; i < $scope.widgets.length; i++) {
                if ($scope.widgets[i].y > maxy) {
                    maxy = $scope.widgets[i].y + $scope.widgets[i].height;
                }

            }
            maxy = maxy + 1;
            // var newWidget = {
            //     x: 0,
            //     y: maxy,
            //     width: 4,
            //     height: 4,
            //     auto: 0,
            //     fontColor: "",
            //     backgroundColor: "",
            //     tableType: "",
            //     typeContent: ""
            // };
            // if (!$scope.widgets)
            //     $scope.widgets = [];
            // $scope.widgets.push(newWidget);


            // var pagesNumber = parseInt(Math.ceil(($(".grid1").height()-($scope.widgetheight))/($scope.widgetheight-$scope.headerAreaHeight-$scope.footerAreaHeight)));
            // $(".grid1").height($scope.widgetheight*(1)+pagesNumber*($scope.widgetheight-$scope.headerAreaHeight-$scope.footerAreaHeight));

            var pagesNumber = Math.ceil(($(".grid-stack").height() - ($scope.widgetheight)) / ($scope.widgetheight - $scope.headerAreaHeight - $scope.footerAreaHeight));
            var distance = $scope.widgetheight - $scope.headerAreaHeight - $scope.footerAreaHeight;
            // var distance=$scope.widgetheight;
            $(".grid-stack").height($scope.widgetheight + (distance) * (pagesNumber + 1));
            $scope.draweLine();
        }
        $scope.clearWidgets = function () {
            var jsonMessage = {
                title: $filter('translate')('ARE_YOU_SURE_YOU_WANT_TO_DELETE_THIS_TEMPLATE') + "?",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#D0D0D0",
                confirmButtonText: $filter('translate')("YES"),
                cancelButtonText: $filter('translate')("NO"),
                closeOnConfirm: true,
                closeOnCancel: true,
                animation: "false",
                customClass: "animated fadeInUp"
            };
            if ($scope.rtl) {
                $("button.confirm").after($("button.cancel"))
            }


            SweetAlert.swal(jsonMessage, function (isConfirm) {
                if (isConfirm) {
                    $scope.widgets = [];
                    $scope.loadingTemplate = true;
                    if ($scope.RecordID !== 0) {
                        var data = {"StructureID": $scope.RecordID};
                        LeaderMESservice.DeletePrintStructure(data).then(function (response) {
                            $scope.loadingTemplate = false;
                            $('html, body').animate({scrollTop: 0}, 'fast');
                            if (response.error != null) {
                                var messageText = "";
                                if (response.error != null) {
                                    messageText = messageText + response.error.ErrorCode + ' - ' + response.error.ErrorDescription + "\n\n";
                                    //notify({ message: response.error.ErrorCode + ' - ' + response.error.ErrorDescription, classes: 'alert-danger', templateUrl: 'views/common/notify.html'});
                                }
                                notify({
                                    message: messageText,
                                    classes: 'alert-danger',
                                    templateUrl: 'views/common/notify.html'
                                });

                                return;
                            }
                            else {
                                toastr.success("", $filter('translate')('CLEARED_SUCCESSFULLY'));
                                $('html, body').animate({scrollTop: 0}, 'fast');
                            }
                            // $scope.emptyPage($scope.pageDisplay);

                            return;
                        })
                    }
                    else {
                        var messageText = $filter('translate')("THERE_IS_NO_STRUCTURE_TO_REMOVE") + "\n\n";
                        notify({
                            message: messageText,
                            classes: 'alert-danger',
                            templateUrl: 'views/common/notify.html'
                        });
                        $('html, body').animate({scrollTop: 0}, 'fast');
                        $scope.loadingTemplate = false;
                    }
                }

                else {

                }

            });
        };


        $scope.buildBarcode = function (index, w) {
            $timeout(function () {
                JsBarcode(".barcode" + index, w.barcode.text, {
                    fontSize: w.barcode.fontSize,
                    format: w.barcode.format,
                    lineColor: w.barcode.lineColor,
                    width: w.barcode.width,
                    height: w.barcode.height,
                    displayValue: w.barcode.displayvalue,
                    textAlign: w.barcode.textalign,
                    textPosition: w.barcode.textposition,
                    font: w.barcode.font,
                    textMargin: w.barcode.textmargin,
                    background: w.barcode.background,
                    // fontOptions: printModalCtrl.barcode.fontoptions

                })

            }, 200);

        }

        $scope.saveWidgets = function () {

            $scope.loadingTemplate = true;
            var AttributesIDandValues = [];
            var structure = [];
            if ($scope.content.type == 'label') {
                AttributesIDandValues = $scope.headerData.pairs;
            }

            for (var i = 0; i < $scope.widgets.length; i++) {
                var item = $scope.widgets[i];
                if (item.typeContent == 'table' || item.typeContent == 'barcode' || item.typeContent == 'qrcode') {
                    if (item.currentFields) {
                        var index = -1;
                        if (!item.currentTable.table) {
                            index = _.findIndex(structure, {"DataSource": item.currentTable});
                        }
                        else {
                            index = _.findIndex(structure, {"DataSource": item.currentTable.table});
                        }
                        if (item.typeContent == 'table') {
                            for (var j = 0; j < item.currentFields.length; j++) {

                                if (j > 0 || index !== -1) {
                                    if (structure[index].Fields.indexOf(item.currentFields[j].Name.toLowerCase()) == -1)
                                        structure[index].Fields.push(item.currentFields[j].Name.toLowerCase());
                                }
                                else {
                                    if (!item.currentTable.table) {
                                        structure.push({
                                            "DataSource": item.currentTable,
                                            "CriteriaFieldName": item.currentFields[j].CriteriaFieldName,
                                            "Fields": [item.currentFields[j].Name.toLowerCase()],
                                            "ObjectCriteriaFieldName": item.currentFields[j].ObjectCriteriaFieldName
                                        });
                                    }
                                    else {
                                        structure.push({
                                            "DataSource": item.currentTable.table,
                                            "CriteriaFieldName": item.currentFields[j].CriteriaFieldName,
                                            "Fields": [item.currentFields[j].Name.toLowerCase()],
                                            "ObjectCriteriaFieldName": item.currentFields[j].ObjectCriteriaFieldName
                                        });
                                    }
                                    index = structure.length - 1;
                                }
                            }
                        }
                        else if (item.typeContent == 'barcode' || item.typeContent == 'qrcode') {

                            if (!item.currentTable.table) {
                                if (index == -1) {
                                    structure.push({
                                        "DataSource": item.currentTable,
                                        "CriteriaFieldName": item.currentFields.CriteriaFieldName,
                                        "Fields": [item.currentFields.Name.toLowerCase().toLowerCase()],
                                        "ObjectCriteriaFieldName": item.currentFields.ObjectCriteriaFieldName
                                    })
                                }
                                else {
                                    if (structure[index].Fields.indexOf(item.currentFields.Name) == -1) {
                                        structure[index].Fields.push(item.currentFields.Name.toLowerCase());
                                    }
                                }
                                ;
                            }
                            else {
                                if (index == -1) {
                                    structure.push({
                                        "DataSource": item.currentTable.table,
                                        "CriteriaFieldName": item.currentFields.CriteriaFieldName,
                                        "Fields": [item.currentFields.Name.toLowerCase()],
                                        "ObjectCriteriaFieldName": item.currentFields.ObjectCriteriaFieldName
                                    });
                                }
                                else {
                                    if (structure[index].Fields.indexOf(item.currentFields.Name) == -1)
                                        structure[index].Fields.push(item.currentFields.Name.toLowerCase());
                                }
                            }

                        }


                    }
                }
                else if (item.typeContent == 'dynamicfield' && (item.style == 'vertical' || item.style == 'horizontal')) {

                    if (item.LabelTableField) {
                        var currentIndex = _.findIndex(structure, {"DataSource": item.LabelTableField.DataSource});
                        if (currentIndex == -1) {
                            structure.push({
                                "DataSource": item.LabelTableField.DataSource,
                                "CriteriaFieldName": item.LabelTableField.CriteriaFieldName,
                                "Fields": [item.LabelTableField.Name],
                                "ObjectCriteriaFieldName": item.LabelTableField.ObjectCriteriaFieldName
                            });
                        }
                        else {
                            if (!structure[currentIndex].Fields) {
                                structure[currentIndex].Fields = [];
                                structure[currentIndex].Fields.push(item.LabelTableField.Name);

                            }
                            else {
                                if (structure[currentIndex].Fields.indexOf(item.LabelTableField.Name) == -1) {
                                    structure[currentIndex].Fields.push(item.LabelTableField.Name);

                                }
                            }
                        }
                    }

                }
                else if (item.typeContent == 'staticfield' && (item.staticContent == 'file' || item.staticContent == 'diagram' || item.staticContent == 'image')) {
                    if (item.staticContent == 'image') {
                        // var index = _.findIndex(structure, function (row) {
                        //     if (row.DataSource == "Image") {
                        //         if (row.CriteriaFieldName == item.currentImageDiagramType.ObjectTypeID)
                        //             return true;
                        //         else return false;
                        //     }
                        // })
                        // if (index == -1) {
                        if (item.currentImageDiagramType && item.currentImageDiagramType.TargetObjectType)
                            structure.push({
                                "DataSource": "Image",
                                "CriteriaFieldName": item.currentImageDiagramType.TargetObjectType,
                                "Fields": []
                            });
                        // }
                        // else {
                        // }
                    }
                    if (item.staticContent == 'file') {
                        // var index = _.findIndex(structure, {"DataSource": "File"});
                        // if (index !== -1) {
                        //     if (structure[index].Fields.indexOf(item.currentFileID) == -1)
                        //         structure[index].Fields.push(item.currentFileID);
                        // }
                        // else {
                        if (item.currentFileID) {
                            structure.push({
                                "DataSource": "File",
                                "CriteriaFieldName": item.currentFileID,
                                "Fields": []
                            })
                        }
                        ;
                        // }
                    }
                    if (item.staticContent == 'diagram') {
                        // var index = _.findIndex(structure, function (row) {
                        //     if (row.DataSource == "Diagram") {
                        //         if (row.CriteriaFieldName == item.currentImageDiagramType.ObjectTypeID)
                        //             return true;
                        //         else return false;
                        //     }
                        // });
                        //
                        // if (index == -1) {
                        structure.push({
                            "DataSource": "Diagram",
                            "CriteriaFieldName": item.currentImageDiagramType.ObjectTypeID,
                            "Fields": []
                        });
                        // }
                        // else {
                        // }
                    }

                }
            }

            // AttributesIDandValues = :[{FieldName: "Department", Eq: 1, DataType: "num"},{FieldName: "MachineType", Eq: 2, DataType: "num"}]
            /**
             * build structure web
             * */
            var structureWeb = [];
            var widgetHeight = $scope.options.cellHeight;
            for (var i = 0; i < $scope.widgets.length; i++) {
                var item = $scope.widgets[i];
                var temp = {};
                temp.typeContent = item.typeContent;
                temp.x = item.x;
                temp.y = item.y;
                temp.width = item.width;
                temp.height = item.height;
                if (item.y * (widgetHeight + $scope.options.verticalMargin) - $scope.options.verticalMargin < $scope.widgetheight) {
                    temp.firstpage = true;
                }
                if (item.y * (widgetHeight + $scope.options.verticalMargin) - $scope.options.verticalMargin >= $scope.widgetheight
                    && (item.y * (widgetHeight + $scope.options.verticalMargin) - $scope.options.verticalMargin) < $scope.widgetheight * 2 - $scope.headerAreaHeight - $scope.footerAreaHeight) {
                    temp.secoundpage = true;
                }
                switch (item.typeContent) {
                    case "barcode":
                        temp.barcode = item.barcode;
                        temp.barcodeType = item.barcodeType;
                    case "qrcode":
                        temp.qrcode = item.qrcode;
                        temp.qrcodeType = item.qrcodeType;
                    case "table":
                        if (item.typeContent == "table" || item.barcodeType == 'dynamicfield' || item.qrcodeType == 'dynamicfield') {
                            if (item.currentTable && !item.currentTable.table) {
                                temp.currentTable = item.currentTable;
                            }
                            else {
                                temp.currentTable = item.currentTable.table;
                            }
                            // temp.currentFields = angular.copy(item.currentFields);
                            temp.currentFields = item.currentFields;
                        }
                        temp.fontColor = item.fontColor;
                        temp.fontSize = item.fontSize;
                        temp.fontWeightKeys = item.fontWeightKeys;
                        temp.fontWeightValues = item.fontWeightValues;
                        temp.fontUnderlineKeys = item.fontUnderlineKeys;
                        temp.fontUnderlineValues = item.fontUnderlineValues;
                        temp.backgroundColor = item.backgroundColor;

                        temp.fontItalicKeys = item.fontItalicKeys;
                        temp.noTitleKeys = item.noTitleKeys;
                        temp.fontWeightValues = item.fontWeightValues;
                        temp.fontSizeValues = item.fontSizeValues;
                        temp.fontUnderlineValues = item.fontUnderlineValues;
                        temp.fontItalicValues = item.fontItalicValues;
                        temp.backgroundColorValues = item.backgroundColorValues;
                        temp.fontColorValues = item.fontColorValues;
                        temp.numberOfRowsValues = item.numberOfRowsValues;
                        temp.startFromRowValues = item.startFromRowValues;

                        temp.tableHeaderHeight = item.tableHeaderHeight;
                        temp.tableBodyHeight = item.tableBodyHeight;
                        temp.RowsValuesArray = item.RowsValuesArray;

                        break;
                    case "staticfield":
                        if (item.staticContent == 'text' || $scope.arrayOfDates.indexOf(item.staticContent) !== -1) {
                            temp.staticContent = item.staticContent;
                            temp.staticText = item.staticText;
                            temp.fontColor = item.fontColor;
                            temp.fontSize = item.fontSize;
                            temp.fontWeightKeys = item.fontWeightKeys;
                            temp.fontWeightValues = item.fontWeightValues;
                            temp.fontUnderlineKeys = item.fontUnderlineKeys;
                            temp.textHasBorder = item.textHasBorder;
                            temp.borderStyle = item.borderStyle;
                            temp.fontUnderlineValues = item.fontUnderlineValues;
                            temp.backgroundColor = item.backgroundColor;
                            temp.tdir = item.tdir;
                            temp.fontItalicKeys = item.fontItalicKeys;
                            temp.fontItalicValues = item.fontItalicValues;
                            temp.staticTextDirection = item.staticTextDirection;
                        }
                        else if (item.staticContent == 'file') {
                            temp.staticContent = item.staticContent;
                            temp.currentFileID = item.currentFileID;

                        }
                        else if (item.staticContent == 'diagram') {
                            temp.staticContent = item.staticContent;
                            temp.currentImageDiagramType = item.currentImageDiagramType;
                        }
                        else if (item.staticContent == 'image') {
                            temp.staticContent = item.staticContent;
                            temp.currentImageDiagramType = item.currentImageDiagramType;
                        }
                        break;
                    case "dynamicfield":
                        temp.LabelTable = item.LabelTable;
                        temp.LabelTableField = item.LabelTableField;
                        temp.TemplateOptionID = item.TemplateOptionID;
                        temp.cellKeyHeight = item.cellKeyHeight;
                        temp.cellKeyWidth = item.cellKeyWidth;
                        temp.cellValueHeight = item.cellValueHeight;
                        temp.cellValueWidth = item.cellValueWidth;
                        temp.style = item.style;
                        temp.fontColor = item.fontColor;
                        temp.fontSize = item.fontSize;
                        temp.fontColorValues = item.fontColorValues;
                        temp.fontSizeValues = item.fontSizeValues;
                        temp.fontWeightKeys = item.fontWeightKeys;
                        temp.fontWeightValues = item.fontWeightValues;
                        temp.fontUnderlineKeys = item.fontUnderlineKeys;
                        temp.fontItalicKeys = item.fontItalicKeys;
                        temp.noTitleKeys = item.noTitleKeys;
                        temp.fontItalicValues = item.fontItalicValues;
                        temp.fontUnderlineValues = item.fontUnderlineValues;
                        temp.backgroundColor = item.backgroundColor;
                        temp.backgroundColorValues = item.backgroundColorValues;
                        temp.tdir = item.tdir;
                        temp.dir = item.dir;
                        if (item.style == 'horizontal') {

                        }
                        else if (item.style == 'vertical') {

                        }
                        break;
                    case 'blanktable':
                        temp.numberOfRowsValues = item.numberOfRowsValues;
                        temp.startFromRowValues = item.startFromRowValues;
                        temp.numberOfColsValues = item.numberOfColsValues;
                        temp.startFromColsValues = item.startFromColsValues;
                        break;
                }

                structureWeb.push(temp);
            }
            // structureWeb=$scope.widgets;
            var topStructureWeb = {};
            topStructureWeb.structureWeb = structureWeb;
            topStructureWeb.paperType = $scope.paperType;
            topStructureWeb.headerAreaHeight = $scope.headerAreaHeight;
            topStructureWeb.footerAreaHeight = $scope.footerAreaHeight;
            topStructureWeb.printSectionMargin = $scope.printSectionMargin;

            if ($scope.lineSeprator) {
                topStructureWeb.pageCounter = $scope.lineSeprator.length + 1;
            }
            else {
                topStructureWeb.pageCounter = 1;
            }
            topStructureWeb.templateDir = $scope.templateDir;
            var strWebStructure = JSON.stringify(topStructureWeb);
            var strStructure = JSON.stringify(structure);
            // {"objectTypeID":10000,"printStructureLevel":1,"structureWeb": "'id':'11w'","structure": "'id':'11'","printLevelRelatedID":3}
            if ($scope.content && $scope.content.type == 'object') {
                /*TODO isactive = true*/
                LeaderMESservice.SaveObjectPrintDefinition({
                    "objectTypeID": $scope.currentObjectType.ObjectTypeID,
                    "printStructureLevel": $scope.content.printStructureLevel,
                    "structureWeb": strWebStructure,
                    "structure": strStructure,
                    "printLevelRelatedID": $scope.content.printLevelRelatedID,
                    "isActive": $scope.isActive
                    // "isActive": true
                    // "objectTypeID": $scope.currentObjectType.ObjectTypeID,
                    // "printStructureLevel": 2,
                    // "structureWeb": strWebStructure,
                    // "structure": strStructure,
                    // "printLevelRelatedID": 1
                }).then(function (response) {
                    $scope.RecordID = response.LeaderRecordID;
                    $scope.loadingTemplate = false;
                    $('html, body').animate({scrollTop: 0}, 'fast');
                    // if (response.error != null || response.AllErrors.length > 0) {
                    if (response.error != null) {
                        var messageText = "";
                        if (response.error != null) {
                            messageText = messageText + response.error.ErrorCode + ' - ' + response.error.ErrorDescription + "\n\n";
                            //notify({ message: response.error.ErrorCode + ' - ' + response.error.ErrorDescription, classes: 'alert-danger', templateUrl: 'views/common/notify.html'});
                        }
                        // if (response.AllErrors.length > 0) {
                        //     for (var i = 0; i < response.AllErrors.length; i++) {
                        //         messageText = messageText + response.AllErrors[i] + "\n\n";
                        //         //notify({ message: response.AllErrors[i], classes: 'alert-danger', templateUrl: 'views/common/notify.html'});
                        //     }
                        // }
                        notify({
                            message: messageText,
                            classes: 'alert-danger',
                            templateUrl: 'views/common/notify.html'
                        });
                        return;
                    }
                    else {
                        toastr.success("", $filter('translate')('SAVED_SUCCESSFULLY'));
                        // $scope.emptyPage($scope.pageDisplay);
                    }
                }, function () {
                    $scope.loadingTemplate = false;
                });
            }
            else if ($scope.content && $scope.content.type == 'label') {
                var data = {
                    structureWeb: strWebStructure,
                    structure: strStructure,
                    isActive: true,
                    objectTypeID: $scope.headerData.objectID,
                    printLevelRelatedID: AttributesIDandValues
                }
                LeaderMESservice.SavePrintDefinition(data).then(function (response) {
                    $scope.RecordID = response.LeaderRecordID;
                    $scope.loadingTemplate = false;
                    $('html, body').animate({scrollTop: 0}, 'fast');
                    if (response.error != null) {
                        var messageText = "";
                        if (response.error != null) {
                            messageText = messageText + response.error.ErrorCode + ' - ' + response.error.ErrorDescription + "\n\n";
                            //notify({ message: response.error.ErrorCode + ' - ' + response.error.ErrorDescription, classes: 'alert-danger', templateUrl: 'views/common/notify.html'});
                        }
                        // if (response.AllErrors.length > 0) {
                        //     for (var i = 0; i < response.AllErrors.length; i++) {
                        //         messageText = messageText + response.AllErrors[i] + "\n\n";
                        //         //notify({ message: response.AllErrors[i], classes: 'alert-danger', templateUrl: 'views/common/notify.html'});
                        //     }
                        // }
                        notify({
                            message: messageText,
                            classes: 'alert-danger',
                            templateUrl: 'views/common/notify.html'
                        });
                        return;
                    }
                    else {
                        toastr.success("", $filter('translate')('SAVED_SUCCESSFULLY'));
                        // $scope.emptyPage($scope.pageDisplay);
                    }
                }, function () {
                    $scope.loadingTemplate = false;
                });

                if ($scope.currentTemplateOptionAttribute) {

                }
                //
                // var data = {
                //     "LabelID": $scope.Label.LabelID,
                //     "TemplateOptionID": $scope.currentTemplateOption.ID,
                //     "structureWeb": strWebStructure,
                //     "structure": strStructure
                // };
                // if ($scope.ObjectID) {
                //     data.ObjectID = $scope.ObjectID;
                // }
                // if ($scope.currentTemplateOptionAttribute) {
                //     data.langID = $scope.currentTemplateOptionAttribute.ID;
                // }
                // LeaderMESservice.SaveLabelDefinition(data
                // ).then(function (response) {
                //     $scope.loadingTemplate = false;
                //     $('html, body').animate({scrollTop: 0}, 'fast');
                // });
            }


        };

        $scope.onChange = function (event, items, widgets) {
            // $log.log("onChange event: " + event + " items:" + items);

            $scope.draweLine();
        };

        $scope.onDragStart = function (event, ui, item) {

            console.log($scope);
            console.log(item);
            $log.log("onDragStart event: " + event + " ui:" + ui);
        };
        //
        $scope.onDragStop = function (event, ui, item) {
            $log.log("onDragStop event: " + event + " ui:" + ui);
            $scope.draweLine();
            // var headerarea = $scope.checkIfExistsInHeaderArea(ui);
            // if(headerarea) {
            //     $scope.removeExistingItemsInHeaders();
            //     $scope.duplicateHeaders();
            // }
        };

        //
        // $scope.onResizeStart = function (event, ui,item) {
        //
        //     console.log($scope);
        //     console.log(item);
        //
        //     $log.log("onResizeStart event: " + event + " ui:" + ui);
        // };
        //
        // $scope.onResizeStop = function (event, ui) {
        //     $log.log("onResizeStop event: " + event + " ui:" + ui);
        // };

        // $scope.onItemAdded = function (item) {
        //     $log.log("onItemAdded item: " + item);
        // };
        //
        $scope.onItemRemoved = function (item) {
            console.log("onItemRemoved item: " + item);
        };
    };

    // controllerAs: 'printCtrl'
    return {
        restrict: "E",
        templateUrl: template,
        scope: {
            content: '='
        },
        controller: controller
    };
}


angular.module('LeaderMESfe')
    .directive('printListDirective', printListDirective)
    .directive('printListTemplateDirective', printListTemplateDirective);
