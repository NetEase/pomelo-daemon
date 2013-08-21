var logger = require('pomelo-logger').getLogger('pomelo-daemon', __filename);
var util = require('../../util');
var consts = require('../../../config/consts');
var cliff = require('cliff');

module.exports = function(opts) {
	return new Command(opts);
};

module.exports.commandId = 'help';

var Command = function(opt){

}

Command.prototype.handle = function(agent, comd, argv, rl){
	if (!comd) {
		util.errorHandle(argv, rl);
		return;
	}

	var argvs = util.argsFilter(argv);

	if (argvs.length > 2) {
		util.errorHandle(argv, rl);
		return;
	}

	if (comd === 'help') {
		util.help();
		rl.prompt();
		return;
	}

	if (consts.COMANDS_MAP[comd]) {
		var INFOS = consts.COMANDS_MAP[comd];
		for (var i = 0; i < INFOS.length; i++) {
			util.log(INFOS[i]);
		}
		rl.prompt();
		return;
	}

	util.errorHandle(argv, rl);
}