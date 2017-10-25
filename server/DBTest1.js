/**
 * Created by joerghaecker on 30.04.15.
 */

var colors = require('colors');
var util = require('util');
var mongoose = require('mongoose');
var logger = require('tracer').colorConsole({level : 'trace'});
setUpMongo(mongoose);

var inviteschema = new mongoose.Schema({

    creationDate: String,
    owner: String,
    invitedfriends: [String],
    votetext: String,
    status: String,
    yeslist: [String],
    nolist: [String]
});


var inviteList = mongoose.model('Invite', inviteschema);
var user = 'Susanne';

/*var select = util.format(
    ' {"invitedfriends": {$in: [ "%s"]}},' +
    ' "yeslist":  {$nin: ["%s"]},' +
    ' "nolist":{$nin: ["%s"]} ', user, "bla", "bla");
*/


//logger.trace('Get list where user ' + user + " is invited to vote:" + select);

var query = inviteList.find().and( { invitedfriends :  {$in :[user]},
    yeslist:  {$nin: ["joeg"]},
    nolist : {$nin : [user]}});



query.exec(
    function (err, result) {
    if (err) {
        logger.error(util.inspect(err));
        return console.error(err);
    }
    logger.trace('User ' + user + " is invited to votes: " + util.inspect(result));
});


function setUpMongo(mong) {
    var dbUri = 'mongodb://localhost/friends';
    logger.trace('Try connect to db %s', dbUri);
    mong.connect(dbUri);
    mong.connection.on('error', function (err) {
        logger.info(colors.red('Mongoose default connection to %s error: %s'), dbUri, err);
    });
    mong.connection.on('connected', function () {
        logger.info(colors.green('Mongoose default connection open to %s'), dbUri);
    });
    mong.connection.on('disconnected ', function () {
        logger.info(colors.red('Mongoose default connection disconnected'));
    });
}