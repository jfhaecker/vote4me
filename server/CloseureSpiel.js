/**
 * Created by joerghaecker on 18.04.15.
 */

var fs = require('fs');
var util = require('util');

console.log(__filename);


function gehtNicht() {
    for (var i = 0; i < 10; i++) {

        fs.stat(__filename, function (err, stats) {
            console.log(i + ": Size of" + __filename + "=" + stats.size);
        })
    }
}

function geht() {
    for (var i = 0; i < 10; i++) {
        (function(i)
        {
            fs.stat(__filename, function (err, stats) {
                console.log(i + ": Size of" + __filename + "=" + stats.size);
            })
        })(i)
    }
}

gehtNicht();
geht();
