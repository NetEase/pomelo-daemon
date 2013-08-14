/*!
 * pomelo-daemon - killHandler
 * Copyright(c) 2013 fantaysni <fantasyni@163.com>
 * MIT Licensed
 */
var logger = require('pomelo-logger').getLogger(__filename);
var argv = require('optimist').argv;
var cp = require('child_process');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var serverConfig = require('../../../config/server.json');
var consts = require('../../../config/consts');
var port = argv['p'] || argv['P'] || serverConfig['port'];
var util = require('../../util');
var loader = require('../load')();
var async = require('async');
var hawk = require('../hawk');

module.exports = function(req, res) {
	hawk(req, function(err, headers) {
		if (err) {
			res.json(err);
		} else {
			var values = req.query;
			var id = values['id'];
			var type = values['type'];
			var env = values['env'];
			var serverMaps = loader.getServerMaps();
			var servers = serverMaps['servers'];
			var master = serverMaps['master'];

			if (!util.checkServer(master, servers, id, type, env)) {
				if (type === 'master') {
					logger.error(consts.COMANDS_START_MASTER_ERROR);
				} else {
					logger.error(consts.COMANDS_START_SERVER_ERROR);
				}
				res.writeHead(500);
				res.end('bad');
				return;
			}

			var server = {};
			if (type === 'master') {
				server = master[env];
			} else {
				server = util.getServer(servers, id, type, env);
			}

			async.series(
				[
					function killServer(callback) {
						var pid = loader.getPidMapById(id);
						console.log(pid);
						killProcess(pid, function(err) {
							if (err) {
								callback(err);
							} else {
								loader.rmPidMapById(id);
								callback(null);
							}
						});
					}
				],
				function(err) {
					res.writeHead(200, headers);
					res.end('ok');
				}
			);
		}
	});
}

function killProcess(pid, cb) {
	if (!pid) {
		cb('error');
		return;
	}

	var child = exec('kill -9 ' + pid, function(err, stdout, stderr) {
		cb();
	});
}