/*!
 * pomelo-daemon - express route 
 * Copyright(c) 2013 fantaysni <fantasyni@163.com>
 * MIT Licensed
 */

var startHandler = require('./handlers/start');
var killHandler = require('./handlers/kill');
var pingHandler = require('./handlers/ping');

module.exports = function(app){
	
	app.get('/start', startHandler);

	app.get('/kill', killHandler);

	app.get('/ping', pingHandler);
}