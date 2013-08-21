/**
 * Module dependencies.
 */

var logger = require('pomelo-logger').getLogger(__filename);
var express = require('express');
var routes = require('./route');
var http = require('http');
var serverConfig = require('../../config/server.json');

var Server = function(options) {
  this.port = options['port'] || serverConfig['port'];
  this.env = options['env'] || process.cwd();
  this.app = null;
}

module.exports = Server;

Server.prototype.start = function(cb) {
  var self = this;
  var app = express();
  self.app = app;
  app.configure(function() {
    app.use(express.methodOverride());
    app.use(express.bodyParser());
    app.use(express.cookieParser("pomelo-daemon"));
    app.use(express.session({
      secret: "pomelo-daemon"
    }));
    app.use(app.router);
    app.set('port', self.port);
    app.enable('trust proxy');
  });

  routes(app);

  http.createServer(app).listen(app.get('port'), function() {
    logger.info("pomelo-daemon server started on port : " + app.get('port'));
    cb(null, 'ok');
  });
}

// Uncaught exception handler
process.on('uncaughtException', function(err) {
  logger.error(' Caught exception: ' + err);
});