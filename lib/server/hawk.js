var hawk = require('hawk');
var loader = require('./load')();

module.exports = function(req, cb) {
	hawk.server.authenticate(req, credentialsFunc, {}, function(err, credentials, artifacts) {
		var headers = {
			'Content-Type': 'text/plain',
			'Server-Authorization': hawk.server.header(credentials, artifacts, {
				payload: 'ok',
				contentType: 'text/plain'
			})
		};
		cb(err, headers);
	});
}

var credentialsFunc = function(id, callback) {
	var daemonKey = loader.getDaemonKey();
	return callback(null, daemonKey);
};