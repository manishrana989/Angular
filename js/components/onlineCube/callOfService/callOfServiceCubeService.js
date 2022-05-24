
angular.module('LeaderMESfe').factory('CallOfServiceService', function ($q,LeaderMESservice) {
        
    var deffered = $q.defer();

    LeaderMESservice.customAPI('GetAllTechnicians',{}).then(function(res) {
        deffered.resolve(res.AllTechnicians);
    });

    var getAllTechnicians = function(){
        return deffered.promise;
    }

    return {
        getAllTechnicians : getAllTechnicians
    }
});