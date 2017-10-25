var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
//var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var colors = require('colors');

var routes = require('./routes/index');
var users = require('./routes/users');

var webSocket = require('http').Server(express);
var io = require('socket.io').listen(webSocket);
var logger = require('tracer').colorConsole({level : 'trace'});

var util = require('util');
webSocket.listen(8080, function () {
    logger.info('Websocket listening on *:8080');
});


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);


var mongoose = require('mongoose');
setUpMongo(mongoose);

// Mapping username->socket
clients = [];

io.sockets.on('connection', function (socket) {
    logger.trace("Client connected:" + socket.id);
    //console.log("Client connected:" + util.inspect(socket, { showHidden: true, depth: 4 }));

    socket.on('disconnect', function () {
        logger.trace(socket.id+'user disconnected');
    });
    socket.on('register', function (data) {
        logger.trace("Register called" + util.inspect(data))

        clients[data.username] = socket;
        logger.info('Registerd client with username: ' + data.username);
        for (var p in clients) {
            if (clients.hasOwnProperty(p)) {
                logger.trace("Client "+p+ "->"+clients[p].id);
            }
        }
    });
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


var friendschema = new mongoose.Schema({
    owner: String,
    friends: [String]
})

var inviteschema = new mongoose.Schema({

    creationDate: String,
    owner: String,
    invitedfriends: [String],
    votetext: String,
    status: String,
    yeslist: [String],
    nolist: [String]
})

var FriendList = mongoose.model('Friends', friendschema);

var inviteList = mongoose.model('Invite', inviteschema);





app.get('/friends/:id',  function(req, res) {
    handleGetFriendsForUser(req, res);
});

app.get('/myvotelist/:id', function(req, res) {
    handleGetOwnVotes(req, res);
});

app.get('/tovotelist/:id', function (req, res) {
   handleGetInvitationsForVoting(req, res);
});

app.post('/dovote/', function(req, res) {
    handleDoVote(req, res);
});

app.post('/inviteforvote/', function (req, res) {
   handleDoInviteForVoting(req, res);
});

function handleGetFriendsForUser(req, res ) {
    var owner = req.params.id;
    logger.trace('Get friend list for '+owner);
    FriendList.findOne( {'owner': owner}, function (err, friend) {
        if (err) return console.error(err);
        logger.trace("Friendlist for owner:"+owner+": "+util.inspect(friend));
        res.send(friend);
    });
}

function handleGetOwnVotes(req, res) {
    var user = req.params.id;
    logger.trace('Get list of owne vote for user '+user);
    inviteListe.find( {'owner': user}, function(err, result) {
        if (err) {
            logger.error(err);
            return console.error(err);
        }
        logger.trace('User '+user+" has own  votes: "+result.length);
        res.send(result);
    });
}

function handleGetInvitationsForVoting(req, res) {
    var user = req.params.id;

    logger.trace('Get list where user '+user+" is invited to vote");
    var query = inviteList.find().and( {
        invitedfriends :  {$in :[user]},
        yeslist:  {$nin: [user]},
        nolist : {$nin : [user]}});

    query.exec( function(err, result) {
        if (err) {
            logger.error(err);
            return console.error(err);
        }
        logger.trace('User '+user+" is invited to votes: "+util.inspect(result));
        res.send(result);
    });

}



function handleDoVote(req, res) {
    logger.trace('POST '+url1+' Data: ' + util.inspect(req.body));

    var id= req.body.id;
    var friend = req.body.friend;
    var result = req.body.result;
    var owner = req.body.owner;

    var condition = { _id : id};
    var update = {};
    if(result === '1') {
        update = {$push: {yeslist: friend}};
    } else if(result === '-1') {
        update = {$push: {nolist: friend}};
    } else {
        logger.error("Error result invalidstate: Condition:"+ util.inspect(condition)+ "Update:"+util.inspect(update));
        return;
    }

    logger.trace("Saving data to db: Condition:"+ util.inspect(condition)+ "Update:"+util.inspect(update));

    // FIXME: Why call delete here?
    delete update._id;

    inviteList.update(condition, update,{upsert: true}, function(err, numAffected) {
        if(!err) {
            logger.trace("Saved data to db."+util.inspect(numAffected)+" Documents updated.");
            logger.info(friend+' has voted. Notify owner: '+owner);
            // Notify owner of the vote
            var socket = clients[owner];
            if(typeof socket != 'undefined') {
                logger.info(friend+'has voted. Notify owner: '+owner+" "+socket.id);
                socket.emit('votehappend', {from : friend, id : id, result : result });
            } else {
                logger.warn(owner+' not registered');
            }

            res.sendStatus(200);
        } else {
            logger.error("Error saving  data to db " + util.inspect(invite) + " Error:" + err);
            res.sendStatus(500);
        }
    });
}




function handleDoInviteForVoting (req, res) {
    logger.trace('POST '+url+' Data: ' + util.inspect(req.body));

    var creationDate = req.body.creationDate;
    var owner = req.body.owner;
    var votetext = req.body.votetext;
    var invitedfriends = req.body.invitedfriends;
    var status = req.body.status;
    var yeslist = [];
    var nolist = [];
    var invite = new inviteList();
    invite.creationDate = creationDate;
    invite.owner = owner;
    invite.invitedfriends = invitedfriends;
    invite.votetext = votetext;
    invite.status = "New";
    invite.yeslist = yeslist;
    invite.nolist = nolist;

    logger.trace("Saving data to db: " + util.inspect(invite));
    invite.save(function (err) {
        if (!err) {
            logger.trace("Saved data to db ");// + util.inspect(invite));

            res.sendStatus(200);
            logger.trace('Notify invited friends...');
            for (var i=0; i<invitedfriends.length; i++) {
                var friend = invitedfriends[i];
                var socket = clients[friend];

                if(typeof socket != 'undefined') {
                    logger.trace('Nofify friend '+friend+" from"+invite.owner+". Socket is "+socket.id);
                    logger.trace('Sending invite to '+friend+" "+socket.id);
                    socket.emit('invite', {from : invite.owner, id :  invite._id, text : invite.votetext});
                } else {
                    logger.warn(friend+' not registered');
                }


            }
        } else {
            logger.error("Error saving  data to db " + util.inspect(invite) + " Error:" + err);
            res.sendStatus(500);
        }
    })
}





// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        logger.error("ERROR in DEV:"+util.inspect(err));
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    logger.error("ERROR in Prod:"+err);
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
