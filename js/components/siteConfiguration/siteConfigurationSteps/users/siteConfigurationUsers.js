function siteConfigurationUsers() {

    var controller = function ($scope, LeaderMESservice, toastr,$filter) {
        var siteConfigUsersCtrl = this;
        siteConfigUsersCtrl.whiteList = [];
        siteConfigUsersCtrl.blackList = [];

        var getData = function(){
            LeaderMESservice.customGetAPI('GetDomains').then(function(response){
                siteConfigUsersCtrl.whiteList = response.ResponseDictionary.WhiteList;
                siteConfigUsersCtrl.blackList = response.ResponseDictionary.BlackList;
            });
        }

        siteConfigUsersCtrl.addDomain = function(type){
            var body = {};
            var callback = function(){
                siteConfigUsersCtrl.whiteDomain = null;
                siteConfigUsersCtrl.blackDomain = null;
                getData();
                toastr.clear();
                toastr.success("", $filter('translate')('ADDED_SUCCESSFULLY'));
            }
            if(type === "approved"){
                body.domainType = 2;
                body.domainName = siteConfigUsersCtrl.whiteDomain;
            }
            if(type === "blocked"){
                body.domainType = 1;
                body.domainName = siteConfigUsersCtrl.blackDomain;
            }
            updateDomain(body,callback);
        }

        siteConfigUsersCtrl.deleteDomain = function(type, index){
            var body = {};
            var callback = function(){};
            if(type === "approved"){
                body.domainType = 2;
                body.id = siteConfigUsersCtrl.whiteList[index].ID;
                callback = function(){
                    siteConfigUsersCtrl.whiteList.splice(index, 1);
                    toastr.clear();
                    toastr.success("", $filter('translate')('REMOVED_SUCCESSFULLY'));
                }
            }
            if(type === "blocked"){
                body.domainType = 1;
                body.id = siteConfigUsersCtrl.blackList[index].ID;
                callback = function(){
                    siteConfigUsersCtrl.blackList.splice(index, 1);
                    toastr.clear();
                    toastr.success("", $filter('translate')('REMOVED_SUCCESSFULLY'));
                }
            }
            updateDomain(body,callback);
        }

        var updateDomain = function(body,callback){
            LeaderMESservice.customAPI('UpdateDomain',body).then(function(response){
                if (response.error !== null) {
                    notify({
                        message: response.error.ErrorCode + ' - ' + response.error.ErrorDescription,
                        classes: 'alert-danger',
                        templateUrl: 'views/common/notify.html'
                    });
                    return;
                }
                callback();
            });
        };

        getData();
    };

    return {
        restrict: "EA",
        templateUrl: 'js/components/siteConfiguration/siteConfigurationSteps/users/siteConfigurationUsers.html',
        scope: {

        },
        controller: controller,
        controllerAs : "siteConfigUsersCtrl"
    };
}

angular
    .module('LeaderMESfe')
    .directive('siteConfigurationUsers', siteConfigurationUsers);