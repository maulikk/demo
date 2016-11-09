var sprsApp = angular.module('sprsApp', ['ngRoute']);

sprsApp.config(function($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: '/index.html',
            controller: 'con'
        })
});
