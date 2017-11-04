/**
 * Created by joerghaecker on 13.04.15.
 */


var vote4meServices = angular.module('vote4meServices', []);


vote4meServices.factory('currentUserService', function () {
    var currentUserService = {};
    var currentUser = '';

    currentUserService.set = function (name) {
        // console.log('Factory: set current user' + name);
        currentUser = name;
    };

    currentUserService.get = function (name) {
        //console.log('Factory: get currennt user' + currentUser);
        return currentUser;
    };

    return currentUserService;
});

vote4meServices.factory('VotingService', function ($http) {
    var uri = 'http://localhost:8080/dovote/';
    var VotingService = {};

    VotingService.voteTop = function (id, friend, owner) {
        $http.post(uri, {
            id: id,
            friend: friend,
            result: '1',
            owner: owner
        }).then(function (data, status, headers, config) {
            console.log("Post success: " + uri + " " + status);
        }).error(function (data, status, headers, config) {
            console.log('Error http  %s %s %s %s', data, status, header, config);
        })
    }

    VotingService.voteFlop = function (id, friend, owner) {
        $http.post(uri, {
            id: id,
            friend: friend,
            result: '-1',
            owner: owner
        }).then(function (data, status, headers, config) {
            console.log("Post success: " + uri + " " + status);
        }).error(function (data, status, headers, config) {
            console.log('Error http  %s %s %s %s', data, status, header, config);
        })
    }
    return VotingService;

});

vote4meServices.factory('friendListService', ['$http', '$q', function($http, $q) {
    return {
        loadFriendList: function (user) {
            var def = $q.defer();
            var uri = 'http://localhost:3000/friends/' + user;
            $http.get(uri)
                .then(function (data, status, headers, config) {
                    console.log("Got friendlist" + JSON.stringify(data));
                    def.resolve(data);
                })
                .error(function (data, status, headers, config) {
                    console.log('Error http %s %s %s %s %s', uri, data, status, header, config);
                    def.reject("Failed to load friend list");
                });
            return def.promise;
        }
    }
}]);

vote4meServices.factory('invitationService', ['$http', function ($http) {
    var invitationService = {};
    var invitationList = [];
    var myVoteList = [];

    invitationService.set = function (list) {
        invitationList = list;
    }

    invitationService.get = function () {
        return invitationList;
    }

    invitationService.getById = function (voteId) {
        for (var i = 0; i < invitationList.length; i++) {
            var id = invitationList[i]._id;
            if (id === voteId) {
                return invitationList[i];
            }
        }
        console.log("Error: Vote with Id:" + voteId + " not found");
    }

    invitationService.loadInvitations = function (user) {
        console.log("load invitations for " + user);

	$http({
		method: 'Get',
		url: 'tovotelist'
	}).then(function successCallback(response) {
        	console.log("Got list to vote" + JSON.stringify(response));
	}, function errorCallback(response) {
		console.log("Error:"+response);
	});
 	

        /*var uri = 'http://localhost:3000/tovotelist/' + user;
        console.log("Http get to %s", uri);
        $http.get(uri).
            then(function (data, status, headers, config) {
                invitationList = data;
            }).
            error(function (data, status, headers, config) {
                console.log('Error http %s %s %s %s %s', uri, data, status, header, config);
            });*/
        var invitationList;
        return invitationList;
    }

    invitationService.loadMyVotes = function (user) {
        console.log("loading MyVoteList for " + user);
        var uri = 'http://localhost:3000/myvotelist/' + user;
        console.log("Http get to %s", uri);
        $http.get(uri).
            then(function (data, status, headers, config) {
                console.log("Got list for my onwed vote" + JSON.stringify(data));
                myVoteList = data;
            }).
            error(function (data, status, headers, config) {
                console.log('Error http %s %s %s %s %s', uri, data, status, header, config);
            });
        return myVoteList;
    }

    return invitationService;
}])




vote4meServices.factory('votetextRandomService', [function () {
    var votetextRandomService = {};
    var text = [
        'Hallo, wie findet Ihr meine neuen Schuhe? Grüße ',
        'Ich hab mir die Hose einfach mal bei Amazon bestellt. Was meint Ihr? Bis dann ',
        'Steht mir sowas? LG ',
        'Was meint Ihr zu der Brille? Euer',
        'Hallo Frau Stilberaterin. Ist das jetzt gut so? Mit besten Grüßen ',
        'Ich hoffe ich sehe in dem Kleid nicht dick aus. Bis bald ... ',
        'Was für geile Schuhe..',
        'Damit heute abend auf die Piste...was denkt ihr;-)',
        'Meint ihr die Frauen fliegen aus so ein Outfit?'
    ];

    votetextRandomService.get = function (user) {
        return text[Math.floor(Math.random() * text.length)] + user;
    }

    return votetextRandomService;
}])


vote4meServices.factory('EventLogService', function () {
    var eventLog = [];
    var EventLogService = {};

    return {
        data : eventLog,
        push : function (event) {
            console.log("Push data to eventlog:"+event);
            eventLog.push(event);
        }
    };
});








