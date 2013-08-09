var es = require('event-stream');
var fs = require('fs');
var file = 'rpc.log';

var pipe = es.pipeline(
	fs.createReadStream(file, {
		flags: 'r'
	}),
	es.split(),
	es.through(function write(data) {
    this.emit('data', data)
    // this.pause() 
  },
  function end () { //optional
    this.emit('end')
  })
)

pipe.on('data', function(data){
	console.log(data);
	pipe.pause();
});

pipe.on('end', function(){
	console.log('end');
});
