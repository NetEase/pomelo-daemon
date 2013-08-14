/*!
 * pomelo-daemon - startHandler
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

			// TODO 
			// 1: 查出port,检查是否已经启动
			// 2: 拼启动命令
			// 3: spawn 启动
			// 4: 返回启动status
			if (!util.checkServer(master, servers, id, type, env)) {
				if (type === 'master') {
					logger.error(consts.COMANDS_START_MASTER_ERROR);
				} else {
					logger.error(consts.COMANDS_START_SERVER_ERROR);
				}
				res.writeHead(500);
				res.end('checkServer bad');
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
					function checkP(callback) {
						var p = server['port'] || server['clientPort'];
						checkPort(p, function(err, status) {
							if (err || status == 'busy') {
								callback(err || status);
							} else {
								callback(null);
							}
						});
					},
					function spawnServer(callback) {
						var options = [];
						options.push(process.cwd() + '/app');
						options.push('env=' + env);
						options.push('serverType=' + type);
						for (var key in server) {
							options.push(key + '=' + server[key]);
						}
						if (type === 'master') {
							options.push('mode=stand-alone');
						}
						spawnProcess(process.execPath, options, id);
						callback(null);
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

function checkPort(p, cb) {
	if (!p) {
		cb('error');
		return;
	}

	var child = exec('netstat -tln | grep ' + p, function(err, stdout, stderr) {
		if (stdout) {
			cb(null, 'busy');
		} else {
			cb(null, 'leisure');
		}
	});
}

/**
 * Fork child process to run command.
 *
 * @param {String} command
 * @param {Object} options
 * @param {Callback} callback
 *
 */

function spawnProcess(command, options, id, cb) {
	var child = cp.spawn(command, options);
	var prefix = command === 'ssh' ? '[' + host + '] ' : '';

	loader.setPidMap(id, child.pid);
	logger.error('child.pid %j', child.pid);
	child.stderr.on('data', function(chunk) {
		var msg = chunk.toString();
		logger.info(msg);
		cb && cb(msg);
	});

	child.stdout.on('data', function(chunk) {
		var msg = prefix + chunk.toString();
		logger.info(msg);
	});

	child.on('exit', function(code) {
		cb && cb(code === 0 ? null : code);
	});
};