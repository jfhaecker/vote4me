/**
 * Created by joerghaecker on 13.04.15.
 */

var vote4meApp = angular.module('vote4meApp', ['vote4meControllers', 'ngRoute', 'vote4meServices']);

console.log('bla');
vote4meApp.config(['$routeProvider',
function($routeProvider) {
    $routeProvider.
        when('/login', {
            templateUrl: 'partials/login.html',
            controller: 'LoginCtrl'
        }).
        when('/overview', {
            templateUrl: 'partials/overview.html',
            controller: 'OverviewCtrl'
        }).
        when('/invitefriends', {
            templateUrl: 'partials/invitefriends.html',
            controller: 'InviteFriendsForNewVoteCtrl'
        }).
        when('/dovote/:voteId', {
            templateUrl: 'partials/dovote.html',
            controller: 'DoVoteCtrl'
        }).
        otherwise({
            redirectTo: '/login'

        });
    }]);