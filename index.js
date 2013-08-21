var argv = require('optimist').argv;
var cli = require('./lib/client/client');
var server = require('./lib/server/server');
var loader = require('./lib/server/load')();
var serverConfig = require('./config/server.json');
var daemon = require('./lib/daemon');
var logger = require('pomelo-logger').getLogger(__filename);
var showHelp = require('./lib/util').showHelp;

var port = argv['p'] || argv['P'] || serverConfig['port'];
var env = argv['env'] || process.cwd();
var mode = argv['mode'] || 'client';
var debug = argv['debug'] || false;
var log = argv['log'] || false;
var h = argv['h'] || argv['help'];
var pattern = argv['pattern'] || 'rpc-log';
var extra = argv._;

if ((extra && extra.length) || h) {
	showHelp();
	return;
}

if (debug) {
	process.env.debug = true;
}
if (mode === 'client') {
	cli();
} else {
	var daemonServer = new server({
		port: port,
		env: env
	});

	var masterPath = env + "/config/master.json";
	var serversPath = env + "/config/servers.json";
	var daemonPath = env + "/config/daemon.json";
	var mongoPath = env + "/config/mongo.json";
	loader.handle("master", masterPath);
	loader.handle("servers", serversPath);
	loader.handle("daemon", daemonPath);
	daemonServer.start(function(err, status) {
		if (!log) {
			return;
		}
		loader.handle("mongo", mongoPath);
		var d = new daemon();
		d.init(function(err) {
			if (err) {
				logger.error(err);
				process.exit(0);
			}
			d.collect(env + '/logs/', pattern, null, function(err) {

			});
		});
	});
}