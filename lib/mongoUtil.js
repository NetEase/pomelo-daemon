var MongoClient = require('mongodb').MongoClient;
var format = require('util').format;
var logger = require('pomelo-logger').getLogger(__filename);

var MongoDB = function(opt) {
	this.host = opt['host'] || 'localhost';
	this.port = opt['port'] || 27017;
	this.username = opt['username'];
	this.password = opt['password'];
	this.database = opt['database'];
	this.collection = opt['collection'];
	this.db = null;
};

module.exports = MongoDB;

MongoDB.prototype.init = function(cb) {
	var self = this;
	var url = format("mongodb://%s:%s@%s:%s/%s", this.username, this.password, this.host, this.port, this.database);
	console.log(url);
	MongoClient.connect(url, function(err, db) {
		if (err) {
			cb(err);
			return;
		}
		logger.info('connect to mongodb %j %j', self.host, self.port);
		self.db = db;
		cb(null);
	});
};

MongoDB.prototype.insert = function(msg, cb) {
	var self = this;
	this.db.collection(self.collection).insert(msg, function(err, objects) {
		if ( !! err) {
			cb(new Error('mongodb insert message error: %j', msg));
			return;
		}
		cb(err, objects);
	});
};

MongoDB.prototype.findToArray = function(limit, cb) {
	var self = this;
	this.db.collection(self.collection).find({}, {
		'limit': limit,
		'sort': [
			['timestamp', -1]
		]
	}).toArray(function(err, objects) {
		if ( !! err) {
			cb(new Error('mongodb find message error: %j', err));
			return;
		}
		cb(err, objects);
	});
};