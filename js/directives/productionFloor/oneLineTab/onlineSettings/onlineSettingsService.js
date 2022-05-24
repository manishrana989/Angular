angular.module('LeaderMESfe')
    .factory('OnlineSettingsService', function ($sessionStorage, LeaderMESservice, $filter, OnlineService) {
        var rtl = LeaderMESservice.isLanguageRTL();


        //settings
        var displaySettingsByType = {
            online: {
                darkMode: true,
                showTextKeys: true,
                vertical: true,
                aggregateProgressBar: false,
                fullColorMode: true,
                departmentView: true,
                calculateBy: false,
                shapeType: true,
                percentageColors: false,
                selectedScale: true,
                colorMode: true,
                textCustomization : true
            },
            department: {
                darkMode: true,
                showTextKeys: true,
                aggregateProgressBar: false,
                vertical: true,
                fullColorMode: true,
                departmentView: false,
                calculateBy: false,
                shapeType: true,
                percentageColors: false,
                selectedScale: true,
                colorMode: true,
                textCustomization:true
            },
            ShiftProgress: {
                darkMode: false,
                showTextKeys: false,
                aggregateProgressBar: true,
                fullColorMode: false,
                departmentView: true,
                calculateBy: true,
                shapeType: true,
                percentageColors: true,
                selectedScale: true,
                colorMode: false,
                maximize:true,
                textCustomization:false
            }
        };

        //settings data arrays
        var colorModeArray = [
            {
                id: 0,
                name: 'white',
                colorCode: '#ffffff',
                textColor: '#000000',
                clicked: false,
                size: '3.125vw',
                class: '',
            }, {
                id: 1,
                name: 'gray',
                colorCode: '#808080',
                textColor: '#ffffff',
                clicked: false,
                size: '3.125vw',
                class: '',
            }, {
                id: 2,
                name: 'black',
                colorCode: '#000000',
                textColor: '#ffffff',
                clicked: false,
                size: '3.125vw',
                class: '',
            },
        ];

        let squareArrayOnline = [
            {
                id: 0,
                name: '',
                srcActive: 'images/square1_active.png',
                srcInactive: 'images/square1_Inactive.png',
                src: 'images/square1_Inactive.png',
                scale: 1,
                clicked: false,
                size: '3.125vw',
                class: 'small-circle'
            },
            {
                id: 1,
                name: '',
                srcActive: 'images/square2_active.png',
                srcInactive: 'images/square2.png',
                src: 'images/square2.png',
                scale: 1,
                clicked: false,
                size: '3.125vw',
                class: 'small-circle'
            },
            {
                id: 2,
                name: '',
                srcActive: 'images/square3_active.png',
                srcInactive: 'images/square3.png',
                src: 'images/square3.png',
                scale: 1,
                clicked: false,
                size: '3.125vw',
                class: 'small-circle'
            },
            {
                id: 3,
                name: '',
                srcActive: 'images/square4_active.png',
                srcInactive: 'images/square4.png',
                src: 'images/square4.png',
                scale: 1,
                clicked: false,
                size: '3.125vw',
                class: 'small-circle'
            },
            {
                id: 4,
                name: '',
                srcActive: 'images/square5_active.png',
                srcInactive: 'images/square5.png',
                src: 'images/square5.png',
                scale: 1,
                clicked: false,
                size: '3.125vw',
                class: 'small-circle'
            },
            {
                id: 5,
                name: '',
                srcActive: 'images/square6_active.png',
                srcInactive: 'images/square6.png',
                src: 'images/square6.png',
                scale: 1,
                clicked: false,
                size: '3.125vw',
                class: 'small-circle'
            },
            {
                id: 6,
                name: '',
                srcActive: 'images/square7_active.png',
                srcInactive: 'images/square7.png',
                src: 'images/square7.png',
                scale: 1,
                clicked: false,
                size: '3.125vw',
                class: 'small-circle'
            },
            {
                id: 7,
                name: '',
                srcActive: 'images/square8_active.png',
                srcInactive: 'images/square8.png',
                src: 'images/square8.png',
                scale: 1,
                clicked: false,
                size: '3.125vw',
                class: 'small-circle'
            }, {
                id: 8,
                name: '',
                srcActive: 'images/square9_active.png',
                srcInactive: 'images/square9.png',
                src: 'images/square9.png',
                scale: 1,
                clicked: false,
                size: '3.125vw',
                class: 'small-circle'
            },
            
        ];

        let squareArrayShiftProgress = [
            {
                id: 0,
                name: $filter('translate')("VERTICAL"),
                srcActive: 'images/squaresVertical_active.png',
                srcInactive: 'images/squaresVertical_Inactive.png',
                src: 'images/squaresVertical_Inactive.png',
                alt: 'Vertical',
                scale: 1,
                clicked: false,
                size: '3.125vw',
                class: 'small-circle'
            },
            {
                id: 1,
                name: $filter('translate')("HORIZONTAL"),
                srcActive: 'images/squaresHorizontal_active.png',
                srcInactive: 'images/squaresHorizontal_Inactive.png',
                src: 'images/squaresHorizontal_Inactive.png',
                alt: 'Horizontal',
                scale: 1,
                clicked: false,
                size: '3.125vw',
                class: 'small-circle'
            },
        ];

        var squareArray = {
            online: squareArrayOnline,
            department: squareArrayOnline,
            ShiftProgress: squareArrayShiftProgress
        };

        var scaleArray = [
            {
                id: 4,
                name: 'x8-rec',
                srcActive: 'images/rec-on.png',
                srcInactive: 'images/rec.png',
                src: 'images/rec.png',
                scale: 4,
                clicked: false,
                size: '4vw',
                height: '560px',
                class: 'big-circle rec'
            },
            {
                id: 3,
                name: 'x5-rec',
                srcActive: 'images/rec-on.png',
                srcInactive: 'images/rec.png',
                src: 'images/rec.png',
                scale: 2.5,
                clicked: false,
                size: '3.5vw',
                height: '560px',
                class: 'big-circle rec'
            },
            {
                id: 5,
                name: 'x4-rec',
                srcActive: 'images/rec-on.png',
                srcInactive: 'images/rec.png',
                src: 'images/rec.png',
                scale: 2,
                clicked: false,
                size: '3.3vw',
                height: '3.4vw',
                class: 'big-circle rec'
            },
            {
                id: 0,
                name: 'x3-rec',
                srcActive: 'images/rec-on.png',
                srcInactive: 'images/rec.png',
                src: 'images/rec.png',
                scale: 1.5,
                clicked: false,
                size: '3.125vw',
                height: '560px',
                class: 'big-circle rec'
            },
            {
                id: 1,
                name: 'x2-rec',
                srcActive: 'images/rec-on.png',
                srcInactive: 'images/rec.png',
                src: 'images/rec.png',
                scale: 1,
                clicked: true,
                size: '1.875vw',
                height: '560px',
                class: 'medium-circle rec'
            },
            {
                id: 2,
                name: 'x1-rec',
                srcActive: 'images/rec-on.png',
                srcInactive: 'images/rec.png',
                src: 'images/rec.png',
                scale: 0.5,
                clicked: false,
                size: '1.042vw',
                class: 'small-circle rec'
            },];


            var saveSettings = {
                online:0,
                department: 0,
            };
           
    
        //methods
        var saveSettingsFunction = function(type){
            saveSettings[type]++;
        }
        return {
            displaySettingsByType: displaySettingsByType,
            colorModeArray: colorModeArray,
            squareArray: squareArray,
            scaleArray: scaleArray,
            saveSettings:saveSettings,
            saveSettingsFunction:saveSettingsFunction
        }
    });