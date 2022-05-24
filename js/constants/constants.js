angular
    .module('LeaderMESfe')
    .constant('AUTH_EVENTS', {
        loginSuccess: 'auth-login-success',
        loginFailed: 'auth-login-failed',
        logoutSuccess: 'auth-logout-success',
        sessionTimeout: 'auth-session-timeout',
        notAuthenticated: 'auth-not-authenticated',
        notAuthorized: 'auth-not-authorized'
    })
    .constant('USER_ROLES', {
        all: '*'
    })
    .constant('BASE_URL', {
        url: 'https://apidev.my.leadermes.com/LeaderMESApi/'
    })
    .constant('COGNOS', {
        url: 'https://dev.my.leadermes.com/bi',
        enable: true
    })
    .constant('DASHBOARD', {
        show: true
    })
    .constant('PRODUCTION_FLOOR', {
        REFRESH_TIME: 120000, // milliseconds
        FIRST_PAGE: true,
        FIRST_DEPARTMENT: false,
		COLLAPSED: true,
        COLLAPSED_MACHINES: false,
		DASHBOARD_REFRESH_TIME: 300000 // 5 minutes			
	})
    .constant('TASKS', {
        TASKS_REFRESH_TIME: 1000*60*30 // 30 minutes
    })
    .constant('COPYRIGHT',{
        YEAR : "2015-2022"
    })
    .constant('GLOBAL', {
        version : "DF3.0",
        enableRecaptcha : true,
        recaptcha : '6LeHTJoUAAAAAO6Wbbmpnp6yO2cWYvFQUWRrMn1O',
        knowledgeBaseUrl : {
            eng : "https://kb.matics.live/en/",
            heb : "https://kb.matics.live/he/",
            spn : "https://kb.matics.live/en/",
            rus : "https://kb.matics.live/en/",
            chn : "https://kb.matics.live/en/",
            ger : "https://kb.matics.live/en/",
            fre : "https://kb.matics.live/en/",
            ita : "https://kb.matics.live/en/",
            hun : "https://kb.matics.live/en/",
            pol : "https://kb.matics.live/en/",
			rum : "https://kb.matics.live/en/",
        },
        factoryView : "https://leadermes.atlassian.net/servicedesk/customer/kb/view/219283719",
        allMachines : "https://leadermes.atlassian.net/servicedesk/customer/kb/view/236421438",
        online : "https://leadermes.atlassian.net/servicedesk/customer/kb/view/235470849",
        shift : "https://leadermes.atlassian.net/servicedesk/customer/kb/view/206275740",
        machine : "https://leadermes.atlassian.net/servicedesk/customer/kb/view/236585283",
        target : "https://leadermes.atlassian.net/servicedesk/customer/kb/view/219644180",
		machineGroups: "https://leadermes.atlassian.net/servicedesk/customer/portal/5/article/227803197?src=423357010",																											   
    })
    .constant('PRINT_CONSTANTS', {
        templateDir: 'ltr',
        barcodeStringLength: 30
    })
    .constant('GOOGLE_ANALYTICS', {
        tracking_id: "UA-123411602-2"
    })
    .constant('SETTINGS_ICON', [
        {
            "name": "RELEASE_NOTES",
            "url": {
                eng: "https://kb.matics.live/en/articles/5847054-version-2-7",
                heb: "https://kb.matics.live/he/articles/5847054-%D7%92%D7%A8%D7%A1%D7%94-2-7",
				spn: "https://kb.matics.live/en/articles/5847054-version-2-7",
				rus: "https://kb.matics.live/en/articles/5847054-version-2-7",
				chn: "https://kb.matics.live/en/articles/5847054-version-2-7",
				ger: "https://kb.matics.live/en/articles/5847054-version-2-7",
				fre: "https://kb.matics.live/en/articles/5847054-version-2-7",
				ita: "https://kb.matics.live/en/articles/5847054-version-2-7",
				hun: "https://kb.matics.live/en/articles/5847054-version-2-7",
				pol: "https://kb.matics.live/en/articles/5847054-version-2-7",
				rum: "https://kb.matics.live/en/articles/5847054-version-2-7"
            }
        }
    ])
    .constant('DASHBOARD_CONSTANTS', {
        orange: '#ed7e17',
        red: 'red',
        blue: '#058dc7',
        shadedBlue: '#00004f',
        grey: '#f3f3f4',
        titleFontSizeModal: '50px',
        comparedGaugeFontSizeModal: '50px',
        // iconIn:'url(images/expand16x16.png)',
        // iconOut:'url(images/minimize24x24.png)',
        contextButton: false,
        customButton: {
            x: 0,
            y: -5,
            symbolX: 16,
            symbolY: 16,
            symbolSize: 5,
            symbol: 'url(images/expand16x16.png)',
            _titleKey: "tooltip"
        },
        drillDownButton: {
            x: -30,
            y: -5,
            symbolX: 16,
            symbolY: 16,
            symbolSize: 5,
            symbol: 'url(images/drilldown16x16.png)',
            _titleKey: "tooltip"
        },
        modal: {
            modalCustomButton: {
                x: -21,
                y: 3,
                symbolX: 13,
                symbolY: 10,
                symbolSize: 5,
                symbol: 'url(images/minimize24x24.png)',
                _titleKey: "tooltip"
            }
        }
    });