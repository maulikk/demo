// var sprsApp = angular.module('sprsApp', ['ngRoute']);

// sprsApp.config(function($routeProvider) {
//     $routeProvider
//         .when('/', {
//             templateUrl: '/index.html',
//             controller: 'con'
//         })
// });
var app = angular.module('sprsApp', ['ngRoute', 'ngMaterial', 'phonecatControllers']);
app.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
        when('/mail', {
            templateUrl: '../shared/mail/mail.html',
            controller: 'PhoneListCtrl'
        }).
        when('/phones/:phoneId', {
            templateUrl: 'partials/phone-detail.html',
            controller: 'PhoneDetailCtrl'
        }).
        otherwise({
            redirectTo: '/phones'
        });
    }
]);
