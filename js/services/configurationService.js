angular.module("LeaderMESfe").factory("configuration", function ($http, $q) {
  var deferred = $q.defer();
  $http.get("configuration/configuration.json").then(function (data) {
    deferred.resolve(data.data);
  });

  var getSection = function (sectionName) {
    return new Promise(function (resolve, reject) {
      deferred.promise.then(function (configData) {
        if (configData && configData[sectionName]) {
          resolve(configData[sectionName]);
        } else {
          reject({});
        }
      });
    });
  };

  var getSpecific = function (sectionName, field) {
    return new Promise(function (resolve, reject) {
      deferred.promise.then(function (configData) {
        if (configData && configData[sectionName] && configData[sectionName][field]) {
          resolve(configData[sectionName][field]);
        } else {
          reject({});
        }
      });
    });
  };

  return {
    getSection: getSection,
    getSpecific: getSpecific,
  };
});
