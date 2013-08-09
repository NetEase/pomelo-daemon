var logger = require('pomelo-logger').getLogger(__filename);
var util = require('../../util');
var consts = require('../../../config/consts');
var cliff = require('cliff');

module.exports = function(opts) {
	return new Command(opts);
};

module.exports.commandId = 'load';

var Command = function(opt) {

}

Command.prototype.handle = function(agent, comd, argv, rl) {
	if (!comd) {
		util.errorHandle(argv, rl);
		return;
	}

	var argvs = util.argsFilter(argv);

	if (argvs.length < 3) {
		util.errorHandle(argv, rl);
		return;
	}

	var path = argvs[2];

	try {
		var json = require(path);
		if(comd !== 'daemon'){
			agent.serverMaps[comd] = json;
		} else {
			agent.daemonKey = json;
		}
	} catch (e) {
		util.log("command " + argv + " error");
		var LOAD_ERROR = consts.LOAD_ERROR;
		util.log(LOAD_ERROR);
		process.exit(0);
	}
}