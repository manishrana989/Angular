function firstStep() {

    const template = 'js/components/orderTest/firstStep/firstStep.html';

    const controller = function ($scope, toastr, LeaderMESservice, googleAnalyticsService, SweetAlert, $filter) {

        $scope.machineTypeData = {};

        googleAnalyticsService.gaPV('Order_Test');
        const orderTestFirstStepCtrl = this;
        $scope.updateMachineData = function() {
            $scope.stepTwo = {
                value: false
            };
            
            $scope.updateInputsAccordingToSelection(true)
        };

        $scope.dataLoaded = {
            value: false
        };

        $scope.loading = false;

        $scope.stepTwo = {
            value: false
        };

        $scope.close = function() {
            if ($scope.closeModal) {
                $scope.closeModal();
            } else {
                SweetAlert.swal({
                    title: $filter("translate")("ARE_YOU_SURE_YOU_WANT_TO_EXIT"),
                    showCancelButton: true,
                    confirmButtonColor: "#D0D0D0",
                    confirmButtonText: $filter("translate")("YES"),
                    cancelButtonText: $filter("translate")("NO"),
                    closeOnConfirm: true,
                    closeOnCancel: true,
                    animation: "false",
                    customClass: "",
                    background: "#f6f6f6"
                },
                    function (isConfirm) {
                        if (isConfirm) {
                            $scope.dataLoaded = { value: false };
                        }
                    }
                );
            }
        };

        $scope.runFirstStep = function (newOrder) {
            if ($scope.fetching){
                return;
            }
            let bodyReq = {};
            if ($scope.type !== 'material') {
                bodyReq = {
                    JobID:  _.find($scope.joshOptions,{id:orderTestFirstStepCtrl.joshID}).jobid,
                    JoshID: orderTestFirstStepCtrl.joshID,
                    ProductID: $scope.firstProductID,
                    SubType: $scope.test,
                    Samples: orderTestFirstStepCtrl.samples
                };
            }
            else {
                bodyReq = {
                    MaterialID: $scope.id,
                    SubType: $scope.test,
                    Samples: orderTestFirstStepCtrl.samples
                };
            }

            $scope.fetching = true;

            LeaderMESservice.customAPI('SendTestOrder', bodyReq).then(
                function (sendTestOrderResponse) {

                    $scope.testID = sendTestOrderResponse.LeaderRecordID;
                    $scope.fetching = false;
                    $scope.stepTwo = {
                        value: true
                    };
                    if(newOrder){
                        $scope.$broadcast("newOrder")
                    }
                }, function (err) {
                    $scope.fetching = false;
                    toastr.error("", $filter('translate')('SOMETHING_WENT_WRONG'));
                });
        };

        $scope.hideSamples = false;

        $scope.updateValuesSamples = function (testIndx) {
            $scope.showSamples = _.find($scope.subTypesOptions, {id: testIndx}).hassamples;
            $scope.alloweditsamplescount = _.find($scope.subTypesOptions, {id: testIndx}).alloweditsamplescount;
            $scope.defaultsamplescount = _.find($scope.subTypesOptions, {id: testIndx}).defaultsamplescount;
            orderTestFirstStepCtrl.samples = $scope.defaultsamplescount>=0?$scope.defaultsamplescount:0;
        };

        $scope.updateInputsAccordingToSelection = function (firstLoad) {
            var bodyReq = {
            };

            if ($scope.type !== 'material'){
                bodyReq.JobID = $scope.machineTypeData.selectedMachine.CurrentJobID;
                if (!firstLoad) {
                    //build body req according to user selection
                    
                    bodyReq.JoshID = orderTestFirstStepCtrl.joshID || 0;
                    bodyReq.QualityGroupID = $scope.qualityGroupID || 0;
                    bodyReq.ProductGroupID = $scope.productGroupID || 0;
                    bodyReq.ProductID = $scope.productID || 0;
                    bodyReq.SubType = $scope.test || 0;
                    bodyReq.JobID = _.find($scope.joshOptions,{id:orderTestFirstStepCtrl.joshID}).jobid
                }else {
                    orderTestFirstStepCtrl.samples = 0;
                }
            }
            else {
                bodyReq.MaterialID = $scope.id;
                bodyReq.SubType = $scope.test || 0;
            }

            
            $scope.updating = true;
            $scope.loading = true;
            let apiName = 'GetTestOrder';
            if ($scope.type === 'material') {
                apiName = 'GetMaterialTestOrder';
            }            
            LeaderMESservice.customAPI(apiName, bodyReq).then(
                function (res) {

                    $scope.dataLoaded.value = true;
                    $scope.updating = false;
                    $scope.loading = false;

                    $scope.dict = res.ResponseDictionaryDT;
                    orderTestFirstStepCtrl.joshID = res.JoshID;
                    $scope.qualityGroupID = res.QualityGroupID;
                    $scope.productGroupID = res.ProductGroupID;
                    $scope.productID = res.ProductID;
                    $scope.firstProductID = $scope.dict?.Products?.length > 0 ? $scope.dict.Products[0].ID || $scope.dict.Products[0].id : 0;
                    $scope.test = res.SubType;

                    $scope.joshOptions = $scope.dict.JoshIDs;
                    $scope.productGroupOptions = $scope.dict.ProductGroups;
                    $scope.qualityGroupOptions = $scope.dict.QualityGroups;
                    $scope.subTypesOptions = $scope.dict.SubTypes;
                    $scope.productsOptions = $scope.dict.Products;
                });
        };

        if ($scope.id !== undefined){
            $scope.machineTypeData = {
                selectedMachine : {
                    CurrentJobID : $scope.id
                }
            };
            $scope.updateMachineData();
        }

        $scope.$on("runFirstStep", () => {
            $scope.runFirstStep(true);
        })
    };

    return {
        restrict: "E",
        templateUrl: template,
        scope: {
            id : "=",
            type : "=",
            closeModal : "=",
        },
        controller: controller,
        controllerAs: "orderTestFirstStepCtrl"
    };
}

angular
    .module('LeaderMESfe')
    .directive('firstStep', firstStep);