var Tail = require("tailnative");

var lineseparator = "\n";
var tail = new Tail("rpc.log", lineseparator);


tail.on('data', function(data){
    console.log(data);
});

tail.on('error', function(){
    console.log('error');
    tail.close();
});

tail.on('end', function(){
    console.log('end');
});