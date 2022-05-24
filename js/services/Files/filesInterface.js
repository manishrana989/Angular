angular
    .module("LeaderMESfe")
    .factory("filesInterfaceService", function (
        LeaderMESservice,
        $sessionStorage,
        $rootScope,
        $filter,
        $interval,
        googleAnalyticsService,
        GLOBAL,
        $modal,
        TASKS,
        Upload,
        BASE_URL,
        notify,
        $translate
    ) {


        function filesInterfaceCode($scope) {
            $("body").css("overflow-y", "hidden");

            $scope.content = {
                subMenu: {
                    SubMenuTargetTYpe: "custom:FileUploadInterface"
                },
                allowFileUpload:true
            }

            $rootScope.$on("refreshFileInterface", function (event, args) {
                $scope.getS3BucketContent();
            });

            $scope.data={"bucketFiles":[]}

            $scope.getS3BucketContent=()=>{
                LeaderMESservice.customAPI("GetS3BucketContent", {
                }).then(function (response) {
                    $scope.filePrefix=response.FilePrefix;
                    $scope.data.bucketFiles=response.FileList;
                    // angular.forEach($scope.bucketFiles,(file,fileIndex)=>{
                    //     $scope.bucketFiles[fileIndex]["LastMoidfied"]=moment($scope.bucketFiles[fileIndex]["LastMoidfied"]).format('D MMM YYYY');
                    // })

                    $scope.data.bucketFiles.map(file=>{
                        file["LastModified"]=moment(file["LastMoidfied"]).format('D MMM YYYY');
                        return file;
                    });

                    console.log("sync files:",$scope.data.bucketFiles);

                });
            }

            $scope.getS3BucketContent();



            $scope.getFileObject=(fileKey)=>{
                let modifiedFileKey=fileKey.substr(fileKey.indexOf('/')+1,fileKey.length);
                LeaderMESservice.customAPI("GetS3FileObject",
                    {"fileKey":modifiedFileKey})
                    .then(function (response) {
                    console.log("file:",response);
                    let anchor = angular.element('<a/>');
                    anchor.attr({
                        href: response.fileURL,
                        target: '_blank',
                    })[0].click();
                });
            }

            $scope.print = (msg) => {
                console.log(msg);
            }

            $scope.$on('$destroy', function () {
                $("body").css("overflow-y", "initial");
              });


        }

        return {
            filesInterfaceCode: filesInterfaceCode
        };
    });