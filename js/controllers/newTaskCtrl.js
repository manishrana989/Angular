function newTaskCtrl($scope, LeaderMESservice, $translate, $state, AuthService, AUTH_EVENTS, BASE_URL,
    $rootScope, SweetAlert, $sessionStorage, COGNOS, PRODUCTION_FLOOR, COPYRIGHT, configuration, $filter, notify, GLOBAL, $timeout) {

    var newTaskCtrl = this;
    newTaskCtrl.credData = {}

}

angular
    .module('LeaderMESfe')
    .controller('newTaskCtrl', newTaskCtrl);