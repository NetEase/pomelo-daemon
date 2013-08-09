var Tailer = require('tailer');

var tailer = new Tailer("rpc.log", {fromstart: true, delay: 500});

tailer.tail(function(err, line){
    //Do something with the new line in the tailed file
    console.log(line);
});