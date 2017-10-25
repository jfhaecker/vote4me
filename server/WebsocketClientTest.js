/**
 * Created by joerghaecker on 17.04.15.
 */




var io = require('socket.io-client');
var util = require('util');
var testclients = ['joerg', 'Susanne', 'Lena', 'Heinz'];
options = {
    transports: ['websocket'],
    'force new connection': true
};


for (var i=0; i < testclients.length; i++) {

   // console.log(testclients[i]+"  " + util.inspect(socket));

    (function(i) {
        var socket = io.connect('http://localhost:8080', options);
        socket.on('connect', function (clients, user) {
            console.log(testclients[i]+" connect "+socket.id);
            socket.emit('register', {username: testclients[i]});
        });
        socket.on('invite', function (data) {
            console.log(testclients[i]+" invite "+socket.id);
        });
        socket.on('disconnect', function () {
            console.log(testclients[i]+" disconnect "+socket.id);
        });



    })(i)


}