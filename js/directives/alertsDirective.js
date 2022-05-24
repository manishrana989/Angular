function alertsDirective($filter, LeaderMESservice) {

    var template = 'views/common/alerts.html';

    var controller = function ($scope, shiftService) {
        $scope.rtl = LeaderMESservice.isLanguageRTL();

        $scope.alerts = [
            {
                titleEName: 'Set up',
                titleLName: 'הגדרה',
                messages: [
                    {
                        title: 'Arburg-12',
                        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod biben',
                        time: 1545556246,
                    },
                    {
                        title: 'Arburg-3',
                        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod biben',
                        time: 1545556246
                    }
                ],
                icon: 'set-up.png'
            },
            {
                titleEName: 'Stops',
                titleLName: 'עצירות',
                messages: [
                    {
                        title: 'Arburg-2',
                        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod biben',
                        time: 1545556246,
                    },
                    {
                        title: 'Arburg-4',
                        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod biben',
                        time: 1545556246
                    }
                ],
                icon: 'stops.png'
            },
            {
                titleEName: 'Operator',
                titleLName: 'עצירות',
                messages: [
                    {
                        title: 'Arburg-1',
                        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod biben',
                        time: 1545556246,
                    },
                    {
                        title: 'Arburg-10',
                        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod biben',
                        time: 1545556246
                    }
                ],
                icon: 'operator.png'

            },
            {
                titleEName: 'Parameters deviations',
                titleLName: 'עצירות',
                messages: [
                    {
                        title: 'Arburg-10',
                        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod biben',
                        time: 1545556246,
                    },
                    {
                        title: 'Arburg-11',
                        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod biben',
                        time: 1545556246
                    }
                ],
                icon: 'parameters.png'
            },
            {
                titleEName: 'Performance',
                titleLName: 'עצירות',
                messages: [
                    {
                        title: 'Arburg-14',
                        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod biben',
                        time: 1545556246,
                    },
                    {
                        title: 'Arburg-10',
                        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod biben',
                        time: 1545556246
                    }
                ],
                icon: 'performance.png'
            }
        ]

    };

    return {
        restrict: "E",
        templateUrl: template,
        scope: {
            main: '='
        },
        controller: controller,
        controllerAs: "alertsCtrl"
    };
}

angular
    .module('LeaderMESfe')
    .directive('alertsDirective', alertsDirective);