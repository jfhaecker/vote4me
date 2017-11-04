/**
 * Created by joerghaecker on 10.04.15.
 */


'use strict';

// Declare app level module which depends on views, and components
var myControllers = angular.module('vote4meControllers', []);


myControllers.controller('OverviewCtrl', ['$scope', '$http', 'currentUserService', 'invitationService','EventLogService',
    function ($scope, $http, currentUserService, invitationService, EventLogService) {

        $scope.tovotelist = [];
        $scope.eventLog = [];

        function init() {
            var user = currentUserService.get();
            invitationService.loadInvitations(user);
            $scope.tovotelist = invitationService.get();
            $scope.eventLog = EventLogService.get;
        }

        init();

        $scope.getCurrentUser = function () {
            return currentUserService.get();
        };

        $scope.getInvitations = function () {
            return invitationService.get();
        };

       $scope.getEventLog = function() {

           return EventLogService.data;
       }
    }
]);


myControllers.controller('DoVoteCtrl', ['$scope' ,'$http', '$routeParams', '$location','currentUserService','invitationService','VotingService',
    function($scope, $http, $routeParams, $location, currentUserService, invitationService, VotingService) {

        $scope.vote = {};
        var voteId = $routeParams.voteId;
       // console.log('huhu'+voteId);
        $scope.vote = invitationService.getById(voteId);


        var owner = $scope.vote.owner;
        console.log("Voting for :"+JSON.stringify($scope.vote)+" Owner is:"+owner);

        $scope.voteTop = function(id) {
            console.log("This is Top "+id);
            VotingService.voteTop(id, currentUserService.get(), owner);
            $location.path('/overview');
        };

        $scope.voteFlop = function(id) {
            console.log("This is a Flop "+id);
            VotingService.voteFlop(id, currentUserService.get(), owner);
            $location.path('/overview');
        }
    }
]);




myControllers.controller('InviteFriendsForNewVoteCtrl', ['$scope', '$http', '$location', 'currentUserService', 'invitationService','friendListService','votetextRandomService',
    function ($scope, $http, $location, currentUserService, invitationService, friendListService, votetextRandomService) {
        $scope.invites = [true];
        $scope.friends = [];
        $scope.randomtext = votetextRandomService.get(currentUserService.get());


        $scope.getCurrentUser = function () {
            return currentUserService.get();
        };


        function init() {
            var user = currentUserService.get();
            friendListService.loadFriendList(user).
                then(function (data) {
                    console.log("FriendList returned:"+JSON.stringify(data));
                    $scope.friends = data.friends;
                }, function(data) {
                    console.log("FriendList retieval failed");
                });
        }

        init();

        $scope.invite = function () {
            var invitedfriends = [];
            console.log('Have fun with invite:' + $scope.socken + " and invites: " + $scope.invites);
            for (var i = 0; i < $scope.invites.length; i++) {
                if ($scope.invites[i]) {
                    console.log($scope.invites[i] + ": Friend: " + $scope.friends[i]);
                    invitedfriends.push($scope.friends[i]);
                }
            }
            console.log("Invite from " + $scope.getCurrentUser() + " Text:" + $scope.socken + " To:" + JSON.stringify(invitedfriends));


            var now = moment().format('YYYY-MM-D H:mm');
            console.log(now);
            $http.post('http://localhost:8080/inviteforvote/', {
                creationDate: now,
                owner: $scope.getCurrentUser(),
                votetext: $scope.randomtext,
                invitedfriends: invitedfriends
            }).
                success(function (data, status, headers, config) {
                    console.log("Post success: " + status);
                }).
                error(function (data, status, headers, config) {
                    console.log('Error http  %s %s %s %s', data, status, header, config);
                })


            $location.path('/overview');
            console.log("Invite done");

        };


        $scope.getInvitations = function () {
            return invitationService.get();
        }
    }
]);

myControllers.controller('LoginCtrl', ['$scope', '$rootScope', '$http', '$location', 'currentUserService', 'invitationService','EventLogService',
    function ($scope, $rootScope, $http, $location, currentUserService, invitationService, EventLogService) {


        // $scope.tovotelist = [];
        $scope.loginuser = {name: ""};

        $scope.login = function (loginuser) {
            console.log("Login: " + loginuser);
            currentUserService.set(loginuser);
            registerUser();


            $location.path('/overview');
            console.log("Login done");
        }

        $scope.getCurrentUser = function () {
            return currentUserService.get();
        }


        function registerUser() {

            var websocketURL = 'http://localhost:8080';


            // Register current user
            var options = {
                transports: ['websocket'],
                'force new connection': true
            };
            console.log('Try to connect' + $scope.getCurrentUser());
            var socket = io.connect(websocketURL, options);
            socket.on('connect', function (clients, user) {
                console.log($scope.getCurrentUser() + " connect " + socket.id);
                socket.emit('register', {username: $scope.getCurrentUser()});
            });
            socket.on('invite', function (data) {
                console.log('Invite from ' + data.from);
                console.log('Trigger reload of InvitationList for '+$scope.getCurrentUser());
                EventLogService.push("From "+ data.from+": You are invited for vote:"+data.text+"["+data.id+"]");
                invitationService.loadInvitations($scope.getCurrentUser());
            });
            socket.on('votehappend', function(data) {
                console.log("Vote happend "+data.from);
                EventLogService.push("From "+ data.from+": Has voted: "+data.result+"  ["+data.id+"]");
                $rootScope.$digest();
            })
        }


    }]);
