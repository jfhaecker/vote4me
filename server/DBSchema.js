/**
 * Created by joerghaecker on 13.04.15.
 */

var mongoose = require('mongoose');
var friendschema = new mongoose.Schema ({

    owner: String,
    friends : [String]
})

var FriendList = mongoose.model('Friends', friendschema);



var connect = (function connect() {
    mongoose.connect('mongodb://localhost/friends');
})


function insertSample() {
    var f = new FriendList;
    f.owner = 'Lena';
   // f.friends.push("Susanne");
    f.friends.push("Lena");
    f.friends.push("Heinz");
    f.save(function(err){
        if(err)
            console.log(err);
        else
            console.log(f);
    });
}
connect();

insertSample();


