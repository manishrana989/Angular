angular.module('LeaderMESfe').factory('customLoader', function ($http, $q) {
    // return loaderFn
    return function (options) {
        var deferred = $q.defer();
        // do something with $http, $q and key to load localization files

        var data = {
            'WELCOME_TO_MATICS': 'Fooooo'
        };
        // resolve with translation data
        return deferred.resolve(data);
        // or reject with language key
        return deferred.reject(options.key);
    };
});