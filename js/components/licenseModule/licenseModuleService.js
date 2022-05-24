angular.module('LeaderMESfe')
    .factory('LicenseService', function (LeaderMESservice, SweetAlert, $filter) {

        var checkLicenseModuleReq = function(modulesID){
            return new Promise(function(resolve,reject){
                LeaderMESservice.customAPI('CheckModulesLicenses',{ModulesID : [modulesID]}).then(function(response){
                    var data = {};

                    data.viewChild = true;

                    checkLicenseModule(response,modulesID,data);

                    if (!data.viewChild){
                        SweetAlert.swal('',data.message, "error");
                        return reject();
                    }

                    return resolve();
                });
            });
        };

        var checkLicenseModule = function(response,moduleId,data){
            if (response.ResponseDictionary[moduleId]){
                if (!response.ResponseDictionary[moduleId].IsPurchased && 
                    !response.ResponseDictionary[moduleId].IsTrial){
                        data.message = response.ResponseDictionary[moduleId] && 
                    response.ResponseDictionary[moduleId].Error && 
                    response.ResponseDictionary[moduleId].Error.ErrorDescription;
                    data.viewChild = false;
                }
                else if (!response.ResponseDictionary[moduleId].IsPurchased && 
                    response.ResponseDictionary[moduleId].IsTrial && 
                        response.ResponseDictionary[moduleId].IsExpired){
                            data.viewChild = false;
                            data.message = response.ResponseDictionary[moduleId] && 
                        response.ResponseDictionary[moduleId].Error && 
                        response.ResponseDictionary[moduleId].Error.ErrorDescription;
                }
                else if (!response.ResponseDictionary[moduleId].IsPurchased && 
                    response.ResponseDictionary[moduleId].IsTrial && 
                        !response.ResponseDictionary[moduleId].IsExpired){
                            data.message = response.ResponseDictionary[moduleId] && 
                        response.ResponseDictionary[moduleId].Error && 
                        response.ResponseDictionary[moduleId].Error.ErrorDescription;
                }
            }
        };
    
    return {
        checkLicenseModule : checkLicenseModule,
        checkLicenseModuleReq : checkLicenseModuleReq,
    }
});