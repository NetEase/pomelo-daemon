var consts = require('../config/consts');
var cliff = require('cliff');

var util = {};

module.exports = util;

function log(str) {
	process.stdout.write(str + '\n');
}

function help(rl) {
	var HELP_INFO_1 = consts.HELP_INFO_1;
	for (var i = 0; i < HELP_INFO_1.length; i++) {
		util.log(HELP_INFO_1[i]);
	}

	var COMANDS_ALL = consts.COMANDS_ALL;
	util.log(cliff.stringifyRows(COMANDS_ALL));

	var HELP_INFO_2 = consts.HELP_INFO_2;
	for (var i = 0; i < HELP_INFO_2.length; i++) {
		util.log(HELP_INFO_2[i]);
	}
	rl.prompt();
}

function argsFilter(argv) {
	var argvs = argv.split(' ');
	for (var i = 0; i < argvs.length; i++) {
		if (argvs[i] === ' ') {
			argvs.splice(i, 1);
		}
	}
	return argvs;
}

function errorHandle(comd, rl) {
	console.log('\nunknow command : ' + comd);
	console.log('type help for help infomation\n');
	if (rl) {
		rl.prompt();
	}
}

function checkServer(master, servers, id, type, env) {
	if (type === 'master') {
		if (!master) return false;
		if (!master[env]) return false;
		if (!master[env]['id']) return false;
		if (master[env]['id'] !== id) return false;
		return true;
	} else {
		if (!servers) return false;
		if (!servers[env]) return false;
		if (!servers[env][type]) return false;
		if (!servers[env][type].length) return false;
		var _servers = servers[env][type];
		var flag = false;
		for (var i = 0; i < _servers.length; i++) {
			if (_servers[i]['id'] === id) {
				flag = true;
				break;
			}
		}
		return flag;
	}
}

function checkServerAll(master, servers, env){
	if(!master) return false;
	if(!master[env]) return false;
	if(!servers) return false;
	if(!servers[env]) return false;
	return true;
}

function getServer(servers, id, type, env) {
	var server = {};
	var _servers = servers[env][type];
	for (var i = 0; i < _servers.length; i++) {
		if (_servers[i]['id'] === id) {
			server = _servers[i];
			break;
		}
	}
	return server;
}

function invokeCallback(cb) {
  if(typeof cb === 'function') {
    cb.apply(null, Array.prototype.slice.call(arguments, 1));
  }
};

util.log = log;
util.help = help;
util.invokeCallback = invokeCallback;
util.argsFilter = argsFilter;
util.errorHandle = errorHandle;
util.checkServer = checkServer;
util.checkServerAll = checkServerAll;
util.getServer = getServer;