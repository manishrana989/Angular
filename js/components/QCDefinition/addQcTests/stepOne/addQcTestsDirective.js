function addQcTests() {
  var template = "js/components/QCDefinition/addQcTests/stepOne/addQcTests.html";

  var controller = function ($scope, $rootScope, LeaderMESservice, $timeout, commonFunctions, googleAnalyticsService, $modal, SweetAlert, $filter, toastr, $localStorage) {
    const addQcTestsCtrl = this;
    $scope.IsSaveButonCLick = false;
    $scope.IsNextButonCLick = false;
    $scope.fetching = false;
    $rootScope.$broadcast('showOnTab', 702);
    $scope.faIconChevron = "fa fa-chevron-down";
    $scope.assignCurrentStep = function (step, test) {      
      $scope.step = step;
      $scope.currentTest = test;
      googleAnalyticsService.gaEvent("QC_Module", "step_" + step);
    };

    commonFunctions.fieldChanges($scope);

    $scope.changes = [];
    $scope.recordValue = [];

    $scope.formCallBack = function (data,next,IsSaveButonCLicked) {      
      $scope.emptyPage(data, next,IsSaveButonCLicked)
    };
    $scope.actionName = "SAVE_CHANGES";

    $scope.updateChanges = (changes) => {
      $scope.changes = changes;
    };
    
    $scope.formResult = function () {            
      if (($scope.selectGroup && $scope.selectGroup.SubTestFormID && $scope.currentTest == 0) || $scope.currentTest !== 0) {
        const request = {
          LeaderID: $scope.currentTest && $scope.currentTest.id ? $scope.currentTest.id : 0,
          formID: $scope.currentTest == 0 ? $scope.selectGroup?.SubTestFormID : $scope.currentTest.testtypeid == undefined ?  $scope.selectGroup.SubTestFormID  : $scope.currentTest.testtypeid==1?140: 148,
        };
        const requestResponse = {
          LeaderID: $scope.currentTest && $scope.currentTest.id ? $scope.currentTest.id : 0,
          formID: $scope.currentTest == 0 ? $scope.selectGroup?.SubTestFormID : $scope.currentTest.testtypeid == undefined ?  $scope.selectGroup.SubTestFormID  : $scope.currentTest.testtypeid==1?140: 148,
        };
        $scope.formId =   $scope.currentTest == 0 ? $scope.selectGroup?.SubTestFormID : $scope.currentTest.testtypeid == undefined ?  $scope.selectGroup.SubTestFormID  : $scope.currentTest.testtypeid==1?140: 148;
        $scope.leaderId = $scope.currentTest && $scope.currentTest.id ? $scope.currentTest.id : 0;
        $scope.pairs = [];
        $scope.actionName = "NEXT";
        $scope.otheractionName = "SAVE_CHANGES";
        $scope.showotherButton=true;
        $scope.alwaysShowFooter = true;
        $scope.request = request;
        $scope.SkipSaveOperation = false;
        $scope.api = 'DisplayFormResults'
        $scope.fullSize = false;
        $scope.loading = false;

        $scope.changes = [];
       
        // commonFunctions.formResults($scope, request, requestResponse, "DisplayFormResults", [], false);
      }
    };
    $scope.SaveChanges = function () {  
      $scope.IsSaveButonCLick = true;
    }
    $scope.next = function () {      
      $scope.IsNextButonCLick = true;
    }
    $scope.emptyPage = function (data, next,IsSaveButonCLicked) {   
      const found = _.find(data, { FieldName: "SubTable" });
      const samples = found && found.Eq;
      $scope.NewRecordID= $scope.currentTest? $scope.currentTest.id:$scope.NewRecordID;
      if (next && IsSaveButonCLicked==false) {
        $scope.assignCurrentStep(
          "test-fields",
          $scope.currentTest
            ? $scope.currentTest
            : {
              id: $scope.NewRecordID,
              samples: samples,
            }
        );
      }
    };
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
              toastr.clear();
              toastr.success("", $filter('translate')('RELEASE_TEST_SUCCESSFULLY'));
              $scope.assignCurrentStep('qc-tests');
            })
          }
          else {
            actionItem.disabled = false;
          }
        });
    }
    addQcTestsCtrl.openSelectMachines = function () {
      var currentTest = $scope.currentTest;
      var machineTypeId = (currentTest && currentTest.machinetypeid) || 0;
      var machineType = _.find($scope.changes, { FieldName: "MachineType" });
      if (machineType) {
        machineTypeId = machineType.Eq || 0;
      }
      var modalInstance = $modal.open({
        templateUrl: "js/components/QCDefinition/addQcTests/stepOne/selectMachines.html",
        controller: function ($scope, $compile, $modalInstance, LeaderMESservice, toastr, $filter) {
          $scope.rtl = LeaderMESservice.isLanguageRTL();
          LeaderMESservice.customAPI("GetTestDefMachines", {
            SubType: currentTest.id ? currentTest.id : currentTest,
          }).then(function (response) {
            LeaderMESservice.customAPI("GetAllMachinesForMachineType", { ID: machineTypeId }).then(function (res) {
              response.ResponseDictionaryDT.MachinesList = _.filter(response.ResponseDictionaryDT.MachinesList, function (machine) {
                return _.findIndex(res.machines, { Id: machine.ID }) > -1;
              });

              $scope.allMachines = response.ResponseDictionaryDT.MachinesList;
              $scope.savedMachines = response.ResponseDictionaryDT.SubTypeMachines;
              $scope.savedMachines.forEach(function (selectedMachine) {
                var machine = _.find($scope.allMachines, {
                  ID: selectedMachine.MachineID,
                });
                if (machine) {
                  machine.selected = true;
                }
              });
            });
          });

          $scope.selectAll = {
            value: false,
          };

          $scope.toggleAll = function () {
            $scope.allMachines.forEach(function (machine) {
              machine.selected = $scope.selectAll.value;
            });
          };

          $scope.save = function () {            
            const newMachines = _.map(_.filter($scope.allMachines, { selected: true }), "ID");
            const oldMachines = [];
            $scope.savedMachines.forEach(function (oldMachine) {
              const newIndex = newMachines.indexOf(oldMachine.MachineID);
              if (newIndex >= 0) {
                newMachines.splice(newIndex, 1);
              } else {
                oldMachines.push(oldMachine.MachineID);
              }
            });
            LeaderMESservice.customAPI("SaveTestDefMachines", {
              SubType: currentTest.id ? currentTest.id : currentTest,
              NewMachines: newMachines,
              RemovedMachines: oldMachines,
            }).then(function (response) {
              $scope.close();
              toastr.success("", $filter("translate")("SAVED_SUCCESSFULLY"));
            });
          };

          $scope.close = function () {
            $modalInstance.close();
          };
        },
      });
    };
    $scope.$watch(
      "selectGroup",
      function () {
        $scope.formResult();
      },
      true
    );
    $timeout(function () {
      $('[data-toggle="popover"]').popover();
    }, 500);
  };

  return {
    require: "^qcDefinition",
    restrict: "E",
    templateUrl: template,
    scope: {
      currentTest: "=",
      selectGroup: "=",
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
    controllerAs: "addQcTestsCtrl",
  };
}

angular.module("LeaderMESfe").directive("addQcTests", addQcTests);
