function secondStep(LeaderMESservice, $timeout) {
  var template = "js/components/orderTest/secondStep/secondStep.html";

  const controller = function (LeaderMESservice, $scope, toastr, $filter, $timeout, $modal, notify, $state, $timeout, $window, $sessionStorage, $rootScope, SweetAlert) {

    $scope.rtl = LeaderMESservice.isLanguageRTL();
    $scope.mandatoryFields = false;
    $scope.langname = LeaderMESservice.getLanguage();
    $scope.doSubmit = false;
    $scope.localLanguage = LeaderMESservice.showLocalLanguage();
    const secondStepCtrl = this;
    const generalGroup = {
      id: 0,
      name: "General",
      displayorder: 1,
    };
    $scope.initSecondSteps = function () {
      $scope.closing = false;
      $scope.hideFailedPassed = true;
      $scope.dataLoaded = false;
      $scope.savedSamples = !$scope.stepTwo;
      $scope.orderNewTest = false;
      secondStepCtrl.notAllowedTestsEdit = !$scope.stepTwo && !$sessionStorage.userAuthenticated?.allowQCTestsEdit;
    }
    $scope.initSecondSteps()
    function init(data, test, passed) {
      const getTestDetailsResponse = data;
      secondStepCtrl.testID = test;
      secondStepCtrl.testName = getTestDetailsResponse.TestName;

      $scope.pdfFiles = [];
      $scope.imgFiles = [];

      angular.forEach(data.Files, function (file) {
        if (!file) {
          return;
        }
        if (file.endsWith("pdf")) {
          $scope.pdfFiles.push(file);
        } else {
          $scope.imgFiles.push(file);
        }
      });

      if (!getTestDetailsResponse.TestDetails[0]) {
        if ($scope.stepTwo) {
          $scope.stepTwo.value = false;
        }
        toastr.error("", "Failed Running Test");
        return;
      }

      $scope.groupingTestFields = data.TestFieldsGroups || [];
      $scope.groupsMap = {};
      angular.forEach($scope.groupingTestFields, function (group) {
        $scope.groupsMap[group.id] = [];
      });
      angular.forEach(getTestDetailsResponse.TestFieldsData, function (row) {

        if (row.FieldType == "combo") {
          row.CurrentValue = +row.CurrentValue
          $scope.getSelectValue(row)
        }
        if (!(row.InputType === 2 || row.InputType === 6)) {
          if ($scope.groupsMap.hasOwnProperty(row.GroupID)) {
            $scope.groupsMap[row.GroupID].push(row);
          } else {
            if (!$scope.groupsMap.hasOwnProperty(generalGroup.id)) {
              $scope.groupingTestFields.push(generalGroup);
              $scope.groupsMap[generalGroup.id] = [];
            }
            row.GroupID = generalGroup.id;
            $scope.groupsMap[generalGroup.id].push(row);
          }
        }
      });

      angular.forEach(getTestDetailsResponse.TestSampleFieldsData, function (row) {

        if (row.FieldType == "combo") {
          row.SamplesData = _.map(row.SamplesData, function (sample) {


            sample.Value = +sample.Value;
            return sample;
          })
        }
      })

      /**
       * Mapped status list dictonary,
       * because current value is always string so the map need to have string ID
       * @type {*|Array}
       */
      $scope.statusesDropDownDictionary = _.map(getTestDetailsResponse.StatusList, function (i) {
        return {
          ID: i.ID.toString(),
          Name: i.Name,
        };
      });


      /**
       * If true show green 'passed' label, if false show red 'failed' label, otherwise
       * if null, don't show any label.
       */
      secondStepCtrl.passed = getTestDetailsResponse.TestDetails[0].Passed;
      $scope.hideFailedPassed = secondStepCtrl.passed === null || typeof secondStepCtrl.passed == "undefined";

      /**
       * Server is returning more fields than the actual UI. So, lets build our UI
       * structure that we will iterate(ng-repeat) over it in the View.
       * @type {*|Array}
       */

      $scope.testDetails = getTestDetailsResponse.TestDetailsForm || [];
      $scope.testDetails.sort((a, b) => a.DisplayOrder - b.DisplayOrder);
      $scope.testDetails = _.map($scope.testDetails, function (testDetail) {
        if (testDetail.DisplayType === 7 && testDetail.CurrentValue) {
          testDetail.CurrentValue = moment(testDetail.CurrentValue, "DD/MM/YYYY HH:mm:ss").format("YYYY-MM-DD HH:mm:ss");
        }
        return testDetail;
      });
      let sampleNumberObj = $scope.testDetails.find((it) => it.Name === "ExampleNum");
      if (sampleNumberObj) {
        sampleNumberObj.AllowEntry = sampleNumberObj.AllowEntry && $scope.data.AllowEditSamplesCount;
      }
      const sampleFound = _.find($scope.testDetails, { Name: "Samples" });
      $scope.sampleCounter = sampleFound ? parseInt(sampleFound.CurrentValue) : 1;

      $scope.testFieldsData = getTestDetailsResponse.TestFieldsData;

      //convert CurrentValue if fieldtype is boolean from string to boolen
      angular.forEach($scope.testFieldsData, function (field) {
        if (field.FieldType == "Boolean") {
          if (field.CurrentValue && field.CurrentValue.toLowerCase() == "false") {
            field.CurrentValue = false;
          } else if (field.CurrentValue && field.CurrentValue.toLowerCase() == "true") {
            field.CurrentValue = true;
          }
        } else if (field.FieldType == "time") {
          if (!field.CurrentValue || field.CurrentValue == "") {
            field.CurrentValue = null;
          } else {
            var temp = field.CurrentValue.split(" ")[1].split(":");
            field.CurrentValue = `${temp[0]}:${temp[1]}`;
          }
        }
      });

      $scope.testSampleFieldsData = getTestDetailsResponse.TestSampleFieldsData;

      for (var i = 0; i < $scope.testSampleFieldsData.length; i++) {
        if ($scope.testSampleFieldsData[i] && $scope.testSampleFieldsData[i].SamplesData) {
          $scope.testSampleFieldsData[i].SamplesData.forEach(function (sample) {
            if ($scope.testSampleFieldsData[i].FieldType == "num" && sample.Value != '' && sample.Value != undefined && sample.Value != null) {
              sample.Value = parseFloat(sample.Value);
            }
            if ($scope.savedSamples && sample.Value !== null && sample.Value !== "" && sample.Value !== undefined) {
              sample.CurrentValue = sample.Value === "True";
            }
          });
        }
      }
      $scope.dataLoaded = true;

      $timeout(function () {
        $('[data-toggle="tooltip"]').tooltip();
      }, 500);
    }
    $scope.UpdateButton = function () {
      $scope.mandatoryFields = false;
    }

    $scope.save = function () {
      $scope.doSubmit = false;
      if (!this.doSubmit) {
        return;
      }
      this.doSubmit = false;
      if ($scope.closing) {
        return;
      }
      $scope.mandatoryFields = false;
      const bodyReq = {
        TestID: secondStepCtrl.testID,
      };
      bodyReq.Samples = $scope.sampleCounter;
      bodyReq.TestFields=[];
      angular.forEach($scope.groupsMap, function (testfield) {
        angular.forEach(testfield, function (field) {
          bodyReq.TestFields.push(field);
          field.displayRedborder = null;
          if ((field.CurrentValue == null || field.CurrentValue == "") && field.RequiredField && field.AllowEntry) {
            field.displayRedborder = true;
          }
          if (field.CurrentValue !== null && field.CurrentValue !== "" && field.RequiredField) {
            field.displayRedborder = false;

          }
          if (field.RequiredField == false) {
            field.displayRedborder = false;

          }
          if (field.FieldType == "date" && field.CurrentValue == '' && field.RequiredField) {

            field.displayRedborder = true;
          }

          if (field.FieldType == "time" && field.CurrentValue == '' && field.RequiredField) {

            field.displayRedborder = true;

          }
          if (field.FieldType == "date" && field.CurrentValue !== '' && field.RequiredField) {

            field.displayRedborder = false;
          }
          if (field.FieldType == "time" && field.CurrentValue !== '' && field.RequiredField) {

            field.displayRedborder = false;
          }
          if (field.CurrentValue == '' && field.RequiredField && field.AllowEntry == false) {

            field.displayRedborder = false;
          }
          if (field.FieldType == "combo" && field.CurrentValue == 0 && field.RequiredField && field.AllowEntry) {
            field.displayRedborder = true;

          }
        });
      });
      //re-convert CurrentValue if fieldtype is boolean from boolean to string represnting a boolean
      angular.forEach(bodyReq.TestFields, function (field) {
        if (typeof field.CurrentValue == "boolean") {
          field.CurrentValue = field.CurrentValue.toString().toLowerCase();
        } else if (field.FieldType == "date") {

          field.CurrentValue = moment(field.CurrentValue).add(moment(field.CurrentValue).utcOffset(), "minutes");
        } else if (field.FieldType == "time") {

          field.CurrentValue = `1900-01-01 ${field.CurrentValue}:00`;
        }

        if (field.UpsertType == 0) field.UpsertType = 3;

        if (field.FieldType == "Boolean") {
          if (field.CurrentValue == "true") {
            field.CurrentValue = true;
          } else if (field.CurrentValue == "false") {
            field.CurrentValue = false;
          }
        }

      });
      $scope.testFieldsData = bodyReq.TestFields;
      bodyReq.SampleFields = $scope.testSampleFieldsData;
      console.log(bodyReq.SampleFields);
      angular.forEach(bodyReq.SampleFields, function (sampleField) {
        if (sampleField.UpsertType == 0) sampleField.UpsertType = 3;
        angular.forEach(sampleField.SamplesData, function (sample) {
          sample.displayRedborder = null;
          if (sampleField.FieldType == "Boolean") {
            sample.Value = sample.CurrentValue;
          }

          if ((sample.Value == null || sample.Value == '') && sampleField.RequiredField && sample.CurrentValue == undefined) {

            sample.displayRedborder = true;

          }

          if (sample.Value !== null && sample.Value !== '' && sampleField.RequiredField) {

            sample.displayRedborder = false;

          }
          if (sample.CurrentValue != '' && sample.CurrentValue != null && sampleField.RequiredField) {

            sample.displayRedborder = false;

          }
          if (sampleField.RequiredField === false) {

            sample.displayRedborder = false;

          }

          if ((sample.Value == undefined || sample.Value == '') && sample.UpsertType === 1 && sample.ID == 0) {

            sample.displayRedborder = false;

          }
          if (sampleField.FieldType == "Boolean" && sample.Value == undefined && sampleField.RequiredField && sampleField.AllowEntry) {

            sample.displayRedborder = true;

          }
          if (sampleField.FieldType == "combo" && sample.Value == 0 && sampleField.RequiredField && sampleField.AllowEntry) {
            sample.displayRedborder = true;

          }
          if (sample.UpsertType == 0) sample.UpsertType = 3;
        });
      });

      angular.forEach(bodyReq.SampleFields, function (sampleField) {
        var CountValues = sampleField.SamplesData.filter(c => c.displayRedborder != null && c.displayRedborder != false).length;
        if (CountValues > 0) {
          sampleField.displayRedborder = true;
        } else {
          sampleField.displayRedborder = false;
        }
      });


      var SamplesRedBorderCountValues = bodyReq.SampleFields.filter(c => c.displayRedborder != null && c.displayRedborder != false).length;

      var testFieldsCountValues = 0;
      angular.forEach($scope.groupsMap, function (test) {
        var CountValues = test.filter(c => c.displayRedborder != null && c.displayRedborder != false);
        if (CountValues && CountValues.length > 0) {
          testFieldsCountValues = testFieldsCountValues + 1;
        }
      });

      if (SamplesRedBorderCountValues > 0 && testFieldsCountValues > 0) {
        $scope.mandatoryFields = true;
        $scope.redlinefields = true;
      } else if (SamplesRedBorderCountValues > 0) {
        $scope.mandatoryFields = true;
        $scope.redlinefields = true;
      }
      else if (testFieldsCountValues > 0) {
        $scope.mandatoryFields = true;
        $scope.redlinefields = true;
      }
      else {
        $scope.mandatoryFields = false;
        $scope.redlinefields = false;
      }

      bodyReq.TestDetails = angular.copy($scope.testDetails);
      bodyReq.TestDetails = bodyReq.TestDetails.filter((i) => i.CurrentValue != null && i.AllowEntry);
      bodyReq.TestDetails = _.map(bodyReq.TestDetails, function (testDetail) {
        if (testDetail.DisplayType === 7 && testDetail.CurrentValue) {
          if (typeof testDetail.CurrentValue === "string") {
            testDetail.CurrentValue = moment(testDetail.CurrentValue, "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD HH:mm:ss");
          } else {
            testDetail.CurrentValue = moment(testDetail.CurrentValue).format("YYYY-MM-DD HH:mm:ss");
          }
        }
        return testDetail;
      });

      LeaderMESservice.customAPI("SaveTestDetails", bodyReq).then(function (res) {
        if (res.error) {
          notify({
            message: res.error.ErrorCode + " - " + res.error.ErrorDescription,
            classes: "alert-danger",
            templateUrl: "views/common/notify.html",
          });
          return;
        } else {
          toastr.success("", $filter("translate")("SAVED_SUCCESSFULLY"));
          var passed = res.Passed;
          LeaderMESservice.customAPI("GetTestDetails", { TestID: secondStepCtrl.testID }).then(function (res) {
            const productId = res && res.TestDetails && res.TestDetails[0] && res.TestDetails[0].ProductID;
            const productName = res && res.TestDetails && res.TestDetails[0] && res.TestDetails[0].ProductName;
            const materialId = res && res.TestDetails && res.TestDetails[0] && res.TestDetails[0].MaterialID;
            const machineId = res && res.TestDetails && res.TestDetails[0] && res.TestDetails[0].MachineID;
            const machineName = res && res.TestDetails && res.TestDetails[0] && res.TestDetails[0].MachineName;
            const testId = res && res.TestDetails && res.TestDetails[0] && res.TestDetails[0].SubType;
            const subTypeNameLang = $scope.localLanguage ? 'SubTypeLName' : 'SubTypeEName';
            const testName = res && res.TestDetails && res.TestDetails[0] && res.TestDetails[0][subTypeNameLang];
            res.aftersave = true;
            const subTestFormID = res && res.TestDetails[0] && res.TestDetails[0].SubTestFormID;
            if ((productId || materialId) && testId) {
              LeaderMESservice.customAPI("DisplayFormResults", {
                LeaderID: res.TestDetails[0].SubType,
                formID: subTestFormID,
                pairs: [],
              }).then(function (response) {
                $scope.orderNewTest = true;
                var useSPC = _.find(response.recordValue, { Name: "UseSPC" });
                let startDate = null;
                let endDate = null;
                if (useSPC.value === "True" && $scope.mandatoryFields == false) {
                  var test = _.find(response.recordValue, { Name: "OpenWith" });
                  const testValue = parseInt(test.value);
                  if (testValue) {
                    var testDateValue = {
                      1: 0,
                      2: 28,
                      3: 7,
                      6: 1,
                    };
                    if (testDateValue[testValue]) {
                      startDate = moment().local().subtract(testDateValue[testValue], "days").startOf("day");
                      endDate = moment().local();
                    }
                    var url = $state.href("customFullView", { topMenuId: 700, subMenuId: 730 });
                    if (subTestFormID == 148) {
                      url = `${url}?materialId=${materialId}&testName=${testName}&testId=${testId}&startDate=${startDate || ""}&endDate=${endDate || ""
                        }&SubTestFormID=${subTestFormID}`;
                    }
                    else {
                      url = `${url}?machineId=${machineId}&machineName=${machineName}&productId=${productId}&productName=${productName}&testId=${testId}&testName=${testName}&startDate=${startDate || ""}&endDate=${endDate || ""
                        }&SubTestFormID=${subTestFormID}`;
                    }
                    window.open(url, "_blank");
                  }
                }
              });
            }
            $scope.savedSamples = true;
            if ($scope.mandatoryFields == false) {
              init(res, secondStepCtrl.testID, passed);
            }

          });
        }
      });
    };

    $scope.openImageInModal = function (url) {
      $modal
        .open({
          templateUrl: "views/common/imgInModal.html",
          windowClass: "imageInModal",
          controller: function ($scope, $modalInstance) {
            $scope.imgURL = url;

            $scope.close = function () {
              $modalInstance.close();
            };
          },
        })
        .result.then(function () { });
    };

    $scope.close = function () {
      if ($scope.id === undefined) {
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
              // if ($scope.loaded) {
              //   $scope.loaded.value = false;
              // };
              if ($scope.stepTwo) {
                $scope.stepTwo.value = false;
              };
            }
          }
        );
      } else {
        $scope.closeModal();
      };
    };

    $scope.removeSamplesIndxFromTestSamples = function (index) {
      angular.forEach($scope.testSampleFieldsData, function (sampleColumn) {
        sampleColumn.SamplesData[index].UpsertType = 1;
      });

      $scope.sampleCounter--;
    };

    $scope.addSample = function () {
      $scope.mandatoryFields = false;
      angular.forEach($scope.testSampleFieldsData, function (sampleColumn) {
        sampleColumn.SamplesData.push({
          Value: "",
          UpsertType: 2,
          ID: 0,
        });
      });

      $scope.sampleCounter++;
    };

    LeaderMESservice.customAPI("GetTestDetails", {
      TestID: $scope.testId,
    }).then(
      function (getTestDetailsResponse) {
        $scope.data = getTestDetailsResponse;
        init($scope.data, $scope.testId);
      },
      function (err) {
        toastr.error("", $filter("translate")("SOMETHING_WENT_WRONG"));
      }
    );

    $scope.orderNewTestFun = function () {
      $scope.mandatoryFields = false;
      $scope.$emit("runFirstStep");
      $scope.orderNewTest = false;
    }
    $scope.orderDifferentTestFun = function () {
      $rootScope.$emit("orderDifferentTestSameMachine");
    }
    $scope.$on("newOrder", function () {
      $timeout(function () {
        LeaderMESservice.customAPI("GetTestDetails", {
          TestID: $scope.testId,
        }).then(
          function (getTestDetailsResponse) {
            $scope.initSecondSteps()
            $scope.data = getTestDetailsResponse;
            init($scope.data, $scope.testId);
          },
          function (err) {
            toastr.error("", $filter("translate")("SOMETHING_WENT_WRONG"));
          }
        );
      })
    })

    $scope.printToCart = function (mainClass) {    
      $('.hide-element').css('display', 'none')
      html2canvas($(mainClass)[0]).then(function (canvas) {
        var image = document.createElement("img");
        image.onload = function () {
          var canvas2 = document.createElement("canvas");
          var ctx2 = canvas2.getContext("2d");
          canvas2.width = $(mainClass).width();
          canvas2.height = $(mainClass).height();
          ctx2.drawImage(this, 0, 0, canvas2.width, canvas2.height);
        };

        image.src = canvas.toDataURL("image/png");
        var w = $window.open("", "_blank");
        w.document.write(image.outerHTML);
        w.document.close();
        $timeout(function () {
          w.print();
        }, 300);
        $(mainClass).css('width', 'unset')
        $(`.printForm`).removeClass("hide-print-elements2");
        $('.hide-element').css('display', 'block')
      });
    };

    $scope.getSelectedValue = function (detialTemp) {
      var findComboTestList = _.find(detialTemp.ListValues,{ID:detialTemp?.CurrentValue})
      if(findComboTestList){
        detialTemp.valueName = findComboTestList.Name;
        detialTemp.valueSelect = findComboTestList?.Value    
      }
      $scope.redlinefields = false;
      var SampleFields = $scope.testSampleFieldsData;

      angular.forEach(SampleFields, function (sampleField) {

        angular.forEach(sampleField.SamplesData, function (sample) {
          sample.emptyfield = null;
          if ((sample.Value == null || sample.Value == '') && sampleField.RequiredField && sample.CurrentValue == undefined) {

            sample.emptyfield = true;

          }
          if (sample.Value !== null && sample.Value !== '' && sampleField.RequiredField) {

            sample.emptyfield = false;

          }
          if (sample.CurrentValue != '' && sample.CurrentValue != null && sampleField.RequiredField) {

            sample.emptyfield = false;

          }
          if (sampleField.FieldType == "Boolean" && sample.Value == undefined && sampleField.RequiredField==false) {

            sample.emptyfield = true;

          }
          if (sampleField.FieldType == "combo" && sample.Value == 0 && sampleField.RequiredField==false) {
            sample.emptyfield = true;
          }
          if (sampleField.FieldType == "Boolean" && sample.Value == undefined && sampleField.RequiredField && sampleField.AllowEntry) {

            sample.emptyfield = true;

          }
          if (sampleField.FieldType == "combo" && sample.Value == 0 && sampleField.RequiredField && sampleField.AllowEntry) {
            sample.emptyfield = true;
          }


        });
      });

      angular.forEach(SampleFields, function (sampleField) {
        var CountValues = sampleField.SamplesData.filter(c => c.emptyfield != null && c.emptyfield == false).length;
        if (CountValues > 0) {
          sampleField.emptyfield = false;
        } else {
          sampleField.emptyfield = true;
        }
      });

      var SamplesRedBorderCountValues = SampleFields.filter(c => c.emptyfield != null && c.emptyfield == false).length;


      angular.forEach($scope.groupsMap, function (testfield) {
        angular.forEach(testfield, function (field) {

          field.emptyfield = null;
          if ((field.CurrentValue == null || field.CurrentValue == "") && field.RequiredField && field.AllowEntry) {
            field.emptyfield = true;
          }
          if (field.CurrentValue !== null && field.CurrentValue !== "" && field.RequiredField && field.AllowEntry) {
            field.emptyfield = false;
          }         
          if (field.FieldType == "date" && field.CurrentValue == '' && field.RequiredField) {

            field.emptyfield = true;
          }

          if (field.FieldType == "time" && field.CurrentValue == '' && field.RequiredField) {

            field.emptyfield = true;

          }
          if (field.FieldType == "date" && field.CurrentValue !== '' && field.RequiredField) {

            field.emptyfield = false;
          }
          if (field.FieldType == "time" && field.CurrentValue !== '' && field.RequiredField) {

            field.emptyfield = false;
          }
          if (field.CurrentValue == '' && field.RequiredField && field.AllowEntry == false) {

            field.emptyfield = true;
          }
          if (field.FieldType == "combo" && field.CurrentValue == 0 && field.RequiredField && field.AllowEntry) {
            field.emptyfield = true;
          }

          if (field.FieldType == "Boolean" && field.CurrentValue == undefined && field.RequiredField==false) {

            field.emptyfield = true;

          }
          if (field.FieldType == "combo" && field.CurrentValue == 0 && sampleField.RequiredField==false) {
            field.emptyfield = true;
          }
        });
      });
      var testFieldsCountValues = 0;
      angular.forEach($scope.groupsMap, function (test) {
        var CountValues = test.filter(c => c.emptyfield != null && c.emptyfield == false);
        if (CountValues && CountValues.length > 0) {
          testFieldsCountValues = testFieldsCountValues + 1;
        }
      });


      if (SamplesRedBorderCountValues > 0 && testFieldsCountValues > 0) {
        $scope.mandatoryFields = false;
      } else if (SamplesRedBorderCountValues > 0) {
        $scope.mandatoryFields = false;
      }
      else if (testFieldsCountValues > 0) {
        $scope.mandatoryFields = false;
      }
      else {
        $scope.mandatoryFields = true;
      }
    }
    $scope.getdateChange = function () {
      $scope.mandatoryFields = false;
      $scope.redlinefields = false;
    }

    $scope.getSelectValue = function (detialTemp) {
      $scope.mandatoryFields = false;
      $scope.redlinefields = false;
      var findComboTestList = _.find(detialTemp.ListValues, { ID: detialTemp?.CurrentValue })
      if (findComboTestList) {
        detialTemp.valueName = findComboTestList.Name;
        detialTemp.valueSelect = findComboTestList?.Value
      }
    }
    $scope.getSelectValue2 = function (listID, sample) {
      $scope.mandatoryFields = false;
      $scope.redlinefields = false;
      var findCombo = _.find($scope.testSampleFieldsData, { ID: listID })
      if (findCombo) {
        sample.Name = _.find(findCombo.ListValues, { ID: sample.Value })?.Name
      }
    }
  };

  return {
    restrict: "E",
    templateUrl: template,
    scope: {
      testId: "=",
      stepTwo: "=",
      loaded: "=",
      closeModal: "=",
      id: "="
    },
    controller: controller,
    controllerAs: "secondStepCtrl",
  };
}

angular.module("LeaderMESfe").directive("secondStep", secondStep);
