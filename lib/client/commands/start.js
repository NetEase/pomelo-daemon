var logger = require('pomelo-logger').getLogger(__filename);
var consts = require('../../../config/consts');
var request = require('request');
var util = require('../../util');
var cliff = require('cliff');
var async = require('async');
var hawk = require('hawk');
var querystring = require('querystring');

module.exports = function(opts) {
	return new Command(opts);
};

module.exports.commandId = 'start';

var Command = function(opt) {

}

Command.prototype.handle = function(agent, comd, argv, rl) {
	if (!comd) {
		util.errorHandle(argv, rl);
		return;
	}

	var serverMaps = agent['serverMaps'];
	var servers = serverMaps['servers'];
	var master = serverMaps['master'];
	var argvs = util.argsFilter(argv);
	var env = 'development';
	var id = '';
	var type = '';

	var qs = {
		id: id,
		type: type,
		env: env
	};

	if (comd === 'all') {
		env = argvs[2] || env;
		type = 'all';
		if (!util.checkServerAll(master, servers, env)) {
			util.log(consts.COMANDS_START_ALL_ERROR);
			rl.prompt();
			return;
		}
		// TODO start all
		startAll(agent, master[env], servers[env], qs, rl);
	} else {
		id = comd;
		type = argvs[2];
		env = argvs[3] || env;

		if (!type) {
			var m = id.match(/(\w+)-\w+-\d+/);
			if (m) {
				type = m[1];
			}
		}

		qs['id'] = id;
		qs['type'] = type;
		qs['env'] = env;

		if (type === 'master') {
			if (!util.checkServer(master, servers, id, type, env)) {
				util.log(consts.COMANDS_START_MASTER_ERROR);
				rl.prompt();
				return;
			}
			var server = master[env];
			// TODO start master
			start(agent, server, qs, rl);
		} else {
			if (!util.checkServer(master, servers, id, type, env)) {
				util.log(consts.COMANDS_START_SERVER_ERROR);
				rl.prompt();
				return;
			}
			var server = util.getServer(servers, id, type, env);
			// TODO start server
			start(agent, server, qs, rl);
		}
	}
}

function start(agent, server, qs, rl, cb) {
	var daemonKey = agent['daemonKey'];
	var url = 'http://' + server['host'] + ':' + agent['port'] + '/start?' + querystring.stringify(qs);
	console.log(url);
	var header = hawk.client.header(url, 'GET', {
		credentials: daemonKey,
		ext: consts.DAEMON_EXT
	});

	var opts = {
		uri: url,
		headers: {
			authorization: header.field
		}
	};
	request.get(opts, function(err, resp, status) {
		var isValid = hawk.client.authenticate(resp, daemonKey, header.artifacts, {
			payload: status
		});
		if (cb && typeof cb === 'function') {
			cb(err, {
				code: resp.statusCode,
				status: status,
				isValid: isValid
			});
		} else {
			rl.prompt();
		}
	});
}

function startAll(agent, master, servers, qs, rl) {
	var serverArray = [];
	for (var type in servers) {
		var _servers = servers[type];
		for (var i = 0; i < _servers.length; i++) {
			_servers[i]['type'] = type;
			serverArray.push(_servers[i]);
		}
	}

	async.series([
		function startMaster(callback) {
			var _qs = {
				id: master['id'],
				type: 'master',
				env: qs['env']
			};
			start(agent, master, _qs, rl, function(err, result) {
				if (err || result['code'] !== 200 || result['status'] !== 'ok' || !result['isValid']) {
					callback('error');
				} else {
					util.log(consts.COMANDS_START_MASTER_OK);
					setTimeout(function() {
						callback(null);
					}, consts.START_MASTER_TIMEOUT);
				}
			});
		},
		function startServers(callback) {
			var _i = 0;
			async.whilst(
				function() {
					return _i < serverArray.length;
				},
				function(_cb) {
					var _server = serverArray[_i];
					var _qs = {
						id: _server['id'],
						type: _server['type'],
						env: qs['env']
					};
					start(agent, _server, _qs, rl, function(err, result) {
						if (err || result['code'] !== 200 || result['status'] !== 'ok' || !result['isValid']) {
							_cb('error');
						} else {
							util.log('start ' + _server['id'] + ' ok');
							_i++;
							_cb(null);
						}
					});
				},
				function(err) {
					callback(err);
				}
			);
		}
	], function(err) {
		if (err) {
			util.log('startAll error');
		} else {
			util.log('startAll done');
		}
		rl.prompt();
	})
}