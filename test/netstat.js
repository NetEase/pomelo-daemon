var exec = require('child_process').exec;

function checkPort(p) {
		var child = exec('netstat -tln | grep ' + p, function(err, stdout, stderr){
			console.log(stdout);
		});
}

checkPort(12306);
checkPort(11111);