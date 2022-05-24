function mobileInsightsNotifications() {
  var template =
    "js/components/mobileInsightsNotifications/mobileInsightsNotifications.html";

  var controller = function (
    $scope,
    LeaderMESservice,
    $filter,
    toastr,
    notify,
    $localStorage
  ) {
    var mobileInsightsNotificationsCtrl = this;
    mobileInsightsNotificationsCtrl.rtl = LeaderMESservice.isLanguageRTL();
    mobileInsightsNotificationsCtrl.rtlDir = mobileInsightsNotificationsCtrl.rtl
      ? "rtl"
      : "ltr";
    mobileInsightsNotificationsCtrl.view =
      $localStorage.mobileInsightsView || "grid";
    mobileInsightsNotificationsCtrl.direction = mobileInsightsNotificationsCtrl.rtl
      ? "rtl"
      : "ltr";
    mobileInsightsNotificationsCtrl.topicToggle = function (topic) {
      for (var i = 0; i < topic.data.length; i++) {
        topic.data[i].IsActive = topic.active;
      }
    };

    mobileInsightsNotificationsCtrl.itemToggle = function (item) {
      var mobileInsightTopic = _.find(
        mobileInsightsNotificationsCtrl.mobileInsightsData,
        { key: item.MessageTopic }
      );
      if (mobileInsightTopic) {
        var ans = false;
        for (var i = 0; i < mobileInsightTopic.data.length; i++) {
          if (mobileInsightTopic.data[i].IsActive) {
            ans = true;
          }
        }
        mobileInsightTopic.active = ans;
      }
    };

    mobileInsightsNotificationsCtrl.mobileInsightsData = [
      {
        name: "SET_UP",
        key: "Setup",
        active: false,
        images: {
          inactive: "images/setup-disable.png",
          active: "images/setupp.png",
        },
        data: [],
      },
      {
        name: "STOPS",
        key: "Stops",
        active: false,
        images: {
          inactive: "images/stops-disable.png",
          active: "images/stopss.png",
        },
        data: [],
      },
      {
        name: "OPERATOR",
        key: "Operator",
        active: false,
        images: {
          inactive: "images/operator-disable.png",
          active: "images/operatorr.png",
        },
        data: [],
      },
      {
        name: "PARAMETER_DEVIATION",
        key: "ParameterDeviation",
        active: false,
        images: {
          inactive: "images/parameterss.png",
          active: "images/parameters_enabled.png",
        },
        data: [],
      },
      {
        name: "PERFORMANCE",
        key: "Performance",
        active: false,
        images: {
          inactive: "images/performance-disable.png",
          active: "images/performances.png",
        },
        data: [],
      },
      {
        name: "SERVICE_CALLS",
        key: "ServiceCalls",
        active: false,
        images: {
          inactive: "images/operator-disable.png",
          active: "images/operatorr.png",
        },
        data: [],
      },
    ];

    mobileInsightsNotificationsCtrl.updatemobileInsightsView = function (view) {
      mobileInsightsNotificationsCtrl.view = view;
      $localStorage.mobileInsightsView = view;
    };

    mobileInsightsNotificationsCtrl.save = function () {
      if (mobileInsightsNotificationsCtrl.loadingSave) {
        return;
      }
      mobileInsightsNotificationsCtrl.loadingSave = true;
      var changedNotifications = [];
      for (
        var i = 0;
        i < mobileInsightsNotificationsCtrl.mobileInsightsData.length;
        i++
      ) {
        var topic = mobileInsightsNotificationsCtrl.mobileInsightsData[i];
        topic.data.forEach(function (notification) {
          var originalNotification = _.find(
            mobileInsightsNotificationsCtrl.originalNotifications,
            { ID: notification.ID }
          );
          if (originalNotification) {
            delete notification.$$hashKey;
            if (
              JSON.stringify(originalNotification) !==
              JSON.stringify(notification)
            ) {
              if (notification.CompareValue === ''){
                notification.CompareValue = null;
              }
              changedNotifications.push(notification);
            }
          } else {
            if (notification.CompareValue === ''){
              notification.CompareValue = null;
            }
            changedNotifications.push(notification);
          }
        });
      }
      if (changedNotifications.length === 0) {
        mobileInsightsNotificationsCtrl.loadingSave = false;
        return;
      }

      LeaderMESservice.customAPI("SaveMobileNotificationsSettings", {
        Notifications: changedNotifications,
      })
        .then(function (response) {
          if (response.error != null) {
            notify({
              message:
                response.error.ErrorCode +
                " - " +
                response.error.ErrorDescription,
              classes: "alert-danger",
              templateUrl: "views/common/notify.html",
            });
          } else {
            mobileInsightsNotificationsCtrl.updateGroup();
            toastr.success("", $filter("translate")("SAVED_SUCCESSFULLY"));
          }
          mobileInsightsNotificationsCtrl.loadingSave = false;
        })
        .catch(function (err) {
          notify({
            message: "Save Failed",
            classes: "alert-danger",
            templateUrl: "views/common/notify.html",
          });
          mobileInsightsNotificationsCtrl.loadingSave = false;
        });
    };

    $scope.checkBoxTemplateIsActive =
      '<div class="full-height ui-grid-cell-contents" check-box-directive field="row.entity" select-value="\'IsActive\'"></div>';

    $scope.checkBoxTemplateRepeatEveryShift =
      '<div class="full-height ui-grid-cell-contents" check-box-directive field="row.entity" select-value="\'RepeatEveryShift\'"></div>';

    $scope.gridOptions = {
      enableFiltering: true,
      showColumnFooter: true,
      showGridFooter: true,
      fastWatch: true,
      columnDefs: [
        {
          name: "ID",
          width: "10%",
          headerCellClass: "text-center",
          extraStyle: "padding=10px",
          cellClass: "text-center",
          displayName: $filter("translate")("ID"),
        },
        {
          name: "Topic",
          width: "20%",
          headerCellClass: "text-center",
          cellClass: "text-center",
          displayName: $filter("translate")("TOPIC"),
        },
        {
          name: "Name",
          width: "20%",
          headerCellClass: "text-center",
          cellClass: "text-center",
          displayName: $filter("translate")("TITLE"),
        },
        {
          name: "MessageText",
          width: "20%",
          headerCellClass: "text-center",
          cellClass: "text-center",
          displayName: $filter("translate")("MESSAGE"),
        },
        {
          name: "CompareValue",
          width: "20%",
          headerCellClass: "text-center",
          cellClass: "text-center",
          displayName: $filter("translate")("COMPARED_VALUES"),
        },
        {
          name: "CompareField",
          width: "20%",
          headerCellClass: "text-center",
          cellClass: "text-center",
          displayName: $filter("translate")("COMPARED_FIELD"),
        },
        {
          name: "RepeatEveryShift",
          width: "20%",
          headerCellClass: "text-center",
          cellClass: "text-center",
          displayName: $filter("translate")("REPEAT_EVERY_SHIFT"),
          cellTemplate: $scope.checkBoxTemplateRepeatEveryShift,
        },
        {
          name: "IsActive",
          width: "20%",
          headerCellClass: "text-center",
          cellClass: "text-center",
          displayName: $filter("translate")("ACTIVE"),
          cellTemplate: $scope.checkBoxTemplateIsActive,
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
      exporterPdfTableHeaderStyle: {
        fontSize: 8,
        bold: true,
        italics: true,
        color: "blue",
      },
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
      exporterPdfOrientation: "landscape",
      exporterPdfPageSize: "LETTER",
      exporterPdfMaxGridWidth: 580,
      exporterCsvLinkElement: angular.element(
        document.querySelectorAll(".custom-csv-link-location")
      ),
    };

    mobileInsightsNotificationsCtrl.updateGroup = function () {
      mobileInsightsNotificationsCtrl.loading = true;
      if (mobileInsightsNotificationsCtrl.selectedGroup) {
        LeaderMESservice.customAPI("GetMobileNotificationsSettings", {
          TemplateID: mobileInsightsNotificationsCtrl.selectedGroup,
        }).then(function (response) {
          mobileInsightsNotificationsCtrl.originalNotifications = [];
          mobileInsightsNotificationsCtrl.gridData = [];
          response.Topics.forEach(function (topic) {
            var mobileInsightTopic = _.find(
              mobileInsightsNotificationsCtrl.mobileInsightsData,
              { key: topic.Key }
            );
            if (mobileInsightTopic) {
              var active = _.find(topic.Notifications, { IsActive: true });
              if (active) {
                mobileInsightTopic.active = true;
              }
              mobileInsightsNotificationsCtrl.gridData = [
                ...mobileInsightsNotificationsCtrl.gridData,
                ..._.map(topic.Notifications, function (noti) {
                  noti.Topic = topic.Name;
                  return noti;
                }),
              ];

              mobileInsightsNotificationsCtrl.originalNotifications = mobileInsightsNotificationsCtrl.originalNotifications.concat(
                topic.Notifications
              );
              mobileInsightTopic.data = JSON.parse(
                JSON.stringify(topic.Notifications)
              );
            }
          });
          mobileInsightsNotificationsCtrl.chosenTopic =
            mobileInsightsNotificationsCtrl.mobileInsightsData[0];
          mobileInsightsNotificationsCtrl.loading = false;
          $scope.gridOptions.data = mobileInsightsNotificationsCtrl.gridData;
        });
      }
    };
    mobileInsightsNotificationsCtrl.selectedGroup = null;
    LeaderMESservice.customAPI("GetUserGroups").then(function (response) {
      mobileInsightsNotificationsCtrl.groups = response.ResponseList;
    });
  };

  return {
    restrict: "E",
    templateUrl: template,
    scope: {},
    controller: controller,
    controllerAs: "mobileInsightsNotificationsCtrl",
  };
}

angular
  .module("LeaderMESfe")
  .directive("mobileInsightsNotifications", mobileInsightsNotifications);
