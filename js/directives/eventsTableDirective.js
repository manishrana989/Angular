function eventsTableDirective() {
  var template = "views/custom/productionFloor/common/eventsTable.html";
  var controller = function ($scope, LeaderMESservice, $timeout) {
    $scope.localLanguage = LeaderMESservice.showLocalLanguage();
    $scope.filteredData = $scope.originalData;
    $scope.showMachines = false;

    $scope.searchObject = {
      ID: "",
      NAME: "",
      TYPE: "",
      ColorID: "",
      IconID: "",
      Machines: "",
      TRANSLATIONS: "",
      IsActive: "",
      DisplayInOpApp: "",
      IsSystem: "",
      TargetPC: "",
    };

    $scope.search = function () {
      var eventFound;
      $scope.filteredData = angular.copy($scope.originalData);
      _.forEach($scope.searchObject, function (searchValue, searchKey) {
        if (searchValue == "" || !searchValue) {
          return;
        }
        if (searchKey == "NAME") {
          searchKey = $scope.localLanguage ? "LName" : "EName";
        }
        $scope.filteredData = _.filter($scope.filteredData, function (data) {
          if (_.has(data, searchKey) && data[searchKey].toString().toLowerCase().startsWith(searchValue.toLowerCase())) {
            data.reasonShow = true;
            return true;
          } else {
            eventFound = _.some(data.Reasons, function (reason) {
              if (_.has(reason, searchKey) && reason[searchKey].toString().startsWith(searchValue)) {
                data.reasonShow = true;
                return true;
              }
            });

            return eventFound ? eventFound : false;
          }
        });
      });
    };
    $scope.searchBoolean = function () {
      $scope.filteredData = angular.copy($scope.originalData);
      _.forEach($scope.searchObject, function (searchValue, searchKey) {
        if (searchValue == "" || !searchValue) {
          return;
        }
        $scope.filteredData = _.forEach($scope.filteredData, function (data) {
          data.Reasons = _.filter(data.Reasons, function (reason) {
            if (_.has(reason, searchKey) && reason[searchKey].toString() == searchValue) {
              data.reasonShow = true;
              return true;
            }
            return false;
          });
        });
      });
    };

    $scope.addNewEmptyGroup = function () {
      $scope.originData.unshift($scope.getEmptyNewGroup());
    };

    $scope.sortableOptions = {
      handle: ".drag-icon",
    };

    $scope.sortableOptionsEvent = {
      handle: ".drag-icon-event",
    };

    $timeout(function () {
      $(".gridTableBody").sortable({ handle: ".drag-icon" });

      $(".reasons").sortable({
        handle: ".drag-icon-event",
      });
    }, 0);
  };

  return {
    restrict: "E",
    templateUrl: template,
    scope: {
      originalData: "=",
      allDepartments: "=",
      showSearchRow: "=",
    },
    controller: controller,
  };
}

angular.module("LeaderMESfe").directive("eventsTableDirective", eventsTableDirective);
