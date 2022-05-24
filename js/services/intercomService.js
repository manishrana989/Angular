angular.module('LeaderMESfe').factory('intercomService', function ($http, $q) {
    // return loaderFn

    window.intercomSettings = {
        app_id: "lmvqzjd9"
    };

    const updateSettings = (name,email, timestamp, siteName, user_id) => {
        window.intercomSettings.name = name;
        // window.intercomSettings.email = email;
        window.intercomSettings.user_id = `${siteName.toLowerCase()}_${user_id}`;
        window.intercomSettings.created_at = timestamp;
        window.intercomSettings.site_name = siteName.toLowerCase();
        window.intercomSettings.company = {
            id : siteName.toLowerCase(),
            name : siteName.toLowerCase(),
        };
        load();
    }

    const load = () => {
        var w = window;
        var ic = w.Intercom;
        if (typeof ic === "function") {
            ic('reattach_activator');
            ic('update', w.intercomSettings);
        } else {
            var d = document;
            var i = function() {
                i.c(arguments);
            };
            i.q = [];
            i.c = function(args) {
                i.q.push(args);
            };
            w.Intercom = i;
            var l = function() {
                var s = d.createElement('script');
                s.type = 'text/javascript';
                s.async = true;
                s.src = 'https://widget.intercom.io/widget/lmvqzjd9';
                var x = d.getElementsByTagName('script')[0];
                x.parentNode.insertBefore(s, x);
            };
            if (document.readyState === 'complete') {
                l();
            } else if (w.attachEvent) {
                w.attachEvent('onload', l);
            } else {
                w.addEventListener('load', l, false);
            }
        }
    };
    return {
        load: load,
        updateSettings: updateSettings,
    };
});