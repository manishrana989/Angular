angular.module('LeaderMESfe').factory('fileUploadService', function ($compile, $state, $filter,$rootScope, LeaderMESservice, BASE_URL, Upload, AuthService, toastr, notify) {


    function fileUpload($scope) {
        $scope.scroll = 0;
        $scope.loading = 'loading';

        $scope.getNavStyle = function (scroll) {
            if (scroll > 100) return 'pdf-controls fixed';
            else return 'pdf-controls';
        };

        $scope.onError = function (error) {
            console.log(error);
        };

        $scope.onLoad = function () {
            $scope.loading = '';
        };

        $scope.onProgress = function (progressData) {
            console.log(progressData);
        };

        $scope.taskFileChanged = function (file) {
            $scope.newTaskFile = file;
            if ($scope.newTaskFile && $scope.newTaskFile.type.indexOf('pdf') >= 0) {
                var currentBlob = new Blob([$scope.newTaskFile], { type: 'application/pdf' });
                $scope.taskPdfUrl = URL.createObjectURL(currentBlob);
            }
        };

        $scope.fileChanged = function (file) {
            $scope.file = file;
            $scope.showAddedFile=true;
            if ($scope.file && $scope.file.type.indexOf('pdf') >= 0) {
                var currentBlob = new Blob([$scope.file], { type: 'application/pdf' });
                $scope.pdfUrl = URL.createObjectURL(currentBlob);
            }
        };

        $scope.localLanguage = LeaderMESservice.showLocalLanguage();

        // upload on file select or drop
        $scope.uploadTask = function (taskID) {

            if (!$scope.newTaskFile) {
                return;
            }
            var fileData = $scope.newTaskFile.name.split(".");
            var fileType = fileData.splice(-1, 1);
            var fileName = fileData.join(".");

            Upload.upload({
                url: BASE_URL.url + 'CreateTaskFilesFromWeb/0/' + fileName + "/" + fileType[0] + "/" + taskID + "/null/0",
                headers: {
                    'x-access-token': AuthService.getAccessToken()
                },
                data: { file: $scope.newTaskFile }
            }).then(function (response) {
                //no error callback, post method was sent ok, but response has error object
                // if (response && response.data.error == null) {
                //     toastr.success("", $filter('translate')('FILE_UPLOADED'));
                //     var url = $state.href('appObjectFullView', {
                //         appObjectName: 'Files',
                //         ID: response.data.LeaderRecordID
                //     });
                //     window.open(url, '_blank');
                // }
                // else {
                //     notify({
                //         message: response.data.error.ErrorMessage + " [" + response.data.error.ErrorCode + "]",
                //         classes: 'alert-danger',
                //         templateUrl: 'views/common/notify.html'
                //     });                
                // }

                console.log("file response", response);

            }, function (err) {
                //error callback from server
                toastr.error("", $filter('translate')('UPLOAD_FILE_FAILED'));
            });
        };

        // upload on file select or drop
        $scope.upload = function () {

            if (!$scope.file) {
                return;
            }
            var fileData = $scope.file.name.split(".");
            var fileType = fileData.splice(-1, 1);
            var fileName = fileData.join(".");

            console.log("content.ID:", $scope.content.ID);
            console.log("file data:");
            console.log(fileType);
            console.log(fileName);


            Upload.upload({
                url: BASE_URL.url + 'Upload/' + $scope.content.ID + "/" + fileName + "/" + fileType[0] + "/null/null/false",
                headers: {
                    'x-access-token': AuthService.getAccessToken()
                },
                data: { file: $scope.file }
            }).then(function (response) {
                //no error callback, post method was sent ok, but response has error object
                if (response && response.data.error == null) {
                    alert("success file!");
                    toastr.success("", $filter('translate')('FILE_UPLOADED'));
                    var url = $state.href('appObjectFullView', {
                        appObjectName: 'Files',
                        ID: response.data.LeaderRecordID
                    });
                    window.open(url, '_blank');
                }
                else {
                    notify({
                        message: response.data.error.ErrorMessage + " [" + response.data.error.ErrorCode + "]",
                        classes: 'alert-danger',
                        templateUrl: 'views/common/notify.html'
                    });
                }

            }, function (err) {
                //error callback from server
                toastr.error("", $filter('translate')('UPLOAD_FILE_FAILED'));
            });
        };

        // upload on file select or drop
        $scope.uploadFile = function () {

            if (!$scope.file) {
                return;
            }
            var fileData = $scope.file.name.split(".");
            var fileType = fileData.splice(-1, 1);
            var fileName = fileData.join(".");

            console.log("content.ID:", $scope.content.ID);
            console.log("file data:");
            console.log(fileType);
            console.log(fileName);


            Upload.upload({
                url: BASE_URL.url + 'UploadFile/'+ fileName + "/" + fileType[0],
                headers: {
                    'x-access-token': AuthService.getAccessToken()
                },
                data: { file: $scope.file }
            }).then(function (response) {
                //no error callback, post method was sent ok, but response has error object

                if (response && response.data.error == null) {
                    $scope.showAddedFile=false;
                    let successMessage = $scope.rtl ? "הקובץ הועלה בהצלחה!" :
                        "file uploaded successfuly!";
                    $rootScope.$broadcast("refreshFileInterface", {});
                    notify({
                        message: successMessage,
                        classes: "alert-success",
                        duration: 1000,
                        templateUrl: "views/common/notifyTasks.html"
                    });
                }
                else {
                    $scope.showAddedFile=false;
                    notify({
                        message: response.data.error.ErrorMessage + " [" + response.data.error.ErrorCode + "]",
                        classes: 'alert-danger',
                        templateUrl: 'views/common/notify.html'
                    });
                }




            }, function (err) {
                //error callback from server
                notify({
                    message: response.data.error.ErrorMessage + " [" + response.data.error.ErrorCode + "]",
                    classes: 'alert-danger',
                    templateUrl: 'views/common/notify.html'
                });
            });
        };
    }

    function quickFileUpload($scope) {
        $scope.localLanguage = LeaderMESservice.showLocalLanguage();
        $scope.uploadSent = 0;

        $scope.imageStructure = {
            "ID": 0,
            "LName": "",
            "EName": "",
            "Descr": "",
            "VersionNum": 0,
            "FilePath": null,
            "ValidID": null,
            "QuickDisplay": true,
            "ObjectID": $scope.content.ID,
            "ObjectTypeID": $scope.content.objectTypeID
        };

        $scope.pdfStructure = {
            "ID": 0,
            "LName": "",
            "EName": "",
            "Descr": "",
            "VersionNum": 0,
            "FilePath": null,
            "ValidID": null,
            "QuickDisplay": true,
            "ObjectID": $scope.content.ID,
            "ObjectTypeID": $scope.content.objectTypeID
        };

        LeaderMESservice.customAPI('GetQuickDisplayFileDetails', {
            objectID: $scope.content.ID,
            objectTypeID: $scope.content.objectTypeID
        }).then(function (response) {
            for (var i = 0; i < response.length; i++) {
                if (response[i].FileTypeEName == 'Picture') {
                    $scope.imageStructure = response[i];
                    var type = $scope.imageStructure.FilePath.split(".");
                    type = type.splice(-1, 1);
                    type = type[0];
                    $scope.imageStructure.fileName = ($scope.localLanguage ? $scope.imageStructure.LName : $scope.imageStructure.EName) + "." + type;
                }
                else {
                    $scope.pdfStructure = response[i];
                    $scope.pdfUrl = $scope.pdfStructure.FilePath;
                    $scope.pdfStructure.fileName = ($scope.localLanguage ? $scope.pdfStructure.LName : $scope.pdfStructure.EName) + ".pdf";
                }
            }
        });

        $scope.imageFileChanged = function (file) {
            if (file.type.indexOf('image') < 0) {
                $scope.imageFile = null;
            }
            else {
                $scope.imageFile = file;
            }
        };

        $scope.pdfFileChanged = function (file) {

            if (file && file.type.indexOf('pdf') >= 0) {
                $scope.pdfFile = file;
                var currentBlob = new Blob([$scope.pdfFile], { type: 'application/pdf' });
                $scope.pdfUrl = URL.createObjectURL(currentBlob);
            }
            else {
                $scope.pdfFile = null;
                $scope.pdfUrl = null;
            }
        };

        // upload on file select or drop
        $scope.upload = function (file, fileStructure) {
            // if file is not compatible or not existed. Give feedback to the user..
            if (!file) {
                // use clear to clear previous toastr messages !!
                toastr.clear();
                // use timeout to control timeout of the message !!
                toastr.error("Upload Failed", "File not compatible", { timeOut: 1000 });
                return;
            }
            var fileData = file.name.split(".");
            var fileType = fileData.splice(-1, 1);
            var fileName = fileData.join(".");
            Upload.upload({
                url: BASE_URL.url + 'Upload/' + fileStructure.ID + "/" + fileName + "/" + fileType[0] + "/" + fileStructure.ObjectTypeID + "/" + fileStructure.ObjectID +
                    "/" + fileStructure.QuickDisplay,
                headers: {
                    'x-access-token': AuthService.getAccessToken()
                },
                data: { file: file }
            }).then(function (response) {

                if (response && response.data.error == null) {
                    toastr.success("", file.type + " File Uploaded");
                    $scope.uploadSent--;
                    if ($scope.uploadSent == 0) {
                        LeaderMESservice.refreshPage($scope);
                    }
                }
                else {
                    notify({
                        message: response.data.error.ErrorDescription + " [" + response.data.error.ErrorCode + "]",
                        classes: 'alert-danger',
                        templateUrl: 'views/common/notify.html'
                    });
                }

            }, function (resp) {
                toastr.clear();
                toastr.error("", "Upload" + file.type + " file failed");
            });
        };

        $scope.uploadFiles = function () {
            $scope.uploadSent = 0;
            if ($scope.pdfFile && $scope.pdfFile.type.indexOf('pdf') >= 0) {
                $scope.uploadSent++;
                $scope.upload($scope.pdfFile, $scope.pdfStructure);
                return;
            }
            if ($scope.imageFile && $scope.imageFile.type.indexOf('image') >= 0) {
                $scope.uploadSent++;
                $scope.upload($scope.imageFile, $scope.imageStructure);
                return;
            }

            $scope.upload($scope.imageFile, $scope.imageStructure);

        };

        $scope.onPassword = function (updatePasswordFn, passwordResponse) {
            if (passwordResponse === PDFJS.PasswordResponses.NEED_PASSWORD) {
                updatePasswordFn($scope.pdfPassword);
            } else if (passwordResponse === PDFJS.PasswordResponses.INCORRECT_PASSWORD) {
                console.log('Incorrect password')
            }
        };

    }

    return {
        fileUpload: fileUpload,
        quickFileUpload: quickFileUpload
    }
});