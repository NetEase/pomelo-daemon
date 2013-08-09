var request = require('request');
var readline = require('readline');
var argv = require('optimist').argv;
var consts = require('../../config/consts');
var util = require('../util');
var command = require('./command')();

module.exports = startCli;

var env = argv['env'] || process.cwd();
var port = argv['p'] || 12306;

function startCli() {
	var rl = readline.createInterface(process.stdin, process.stdout);
	command.setRl(rl);
	welcome();
	var PROMPT = 'pomelo-daemon >';
	rl.setPrompt(PROMPT);
	rl.prompt();

	rl.on('line', function(line) {
		var key = line.trim();
		switch (key) {
			case 'help':
				util.help(rl);
				break;
			case '?':
				util.help(rl);
				break;
			case 'quit':
				command.quit();
				break;
			default:
				command.handle(key);
				break;
		}
	}).on('close', function() {
		util.log('\nbye\n');
		process.exit(0);
	});
}

function welcome() {
	var WELCOME_INFO = consts.WELCOME_INFO;
	for (var i = 0, l = WELCOME_INFO.length; i < l; i++) {
		util.log(WELCOME_INFO[i]);
	}
	command.setEnv(env);
	command.setPort(port);
	var masterPath = env + "/config/master.json";
	var serversPath = env + "/config/servers.json";
	var daemonPath = env + "/config/daemon.json";
	command.handle("load master " + masterPath);
	command.handle("load servers " + serversPath);
	command.handle("load daemon " + daemonPath);
}