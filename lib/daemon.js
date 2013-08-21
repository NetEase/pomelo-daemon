/*!
 * pomelo-daemon - daemon
 * Copyright(c) 2013 fantaysni <fantasyni@163.com>
 * MIT Licensed
 */

var configServer = require('../config/server.json');
var logger = require('pomelo-logger').getLogger('pomelo-daemon', __filename);
var exec = require('child_process').exec;
var loader = require('./server/load')();
var MongoClient = require('./mongoUtil');
var schedule = require('pomelo-schedule');
var tmpFile = configServer['tmp'];
var es = require('event-stream');
var async = require('async');
var util = require('util');
var fs = require('fs');
var filesMap = {};

var FLUSH_INTERVAL = 5000;
var MUTEX_FREE = 1;
var MUTEX_LOCK = 2;

var daemon = function() {
	this.mongoClient = null;
	this.tailMap = {};
	this.dataQueue = [];
	this.mutex = MUTEX_FREE;
}

module.exports = daemon;

daemon.prototype.init = function(cb) {
	this.mongoClient = new MongoClient(loader.getMongoConfig());
	if (!fs.existsSync(tmpFile)) {
		fs.writeFileSync(tmpFile, '');
	}
	this.mongoClient.init(cb);
}

daemon.prototype.collect = function(dir, pattern, sync, cb) {
	var self = this;
	fs.readdir(dir, function(err, files) {
		if ( !! err) {
			console.error('read directory error.');
			return;
		}
		var results = [];
		files.forEach(function(filename) {
			if (startsWith(filename, pattern)) {
				results.push(filename);
			}
		});
		syncToMongo(dir, results, self, function(err) {
			if (!sync) {
				self.startSchedule();
			}
			cb(err);
		});
	});
};

daemon.prototype.insertMessage = function(filename, msg, cb) {
	if(process.env.debug)
		logger.info('insertMessage %j %j', filename, msg);
	var mongoClient = this.mongoClient;
	var start = msg.indexOf('{', 0);
	if (start < 0) {
		cb(new Error('error log msg format without json strings'));
		return;
	}
	msg = msg.substring(start);
	mongoClient.insert(JSON.parse(msg), function(err, results) {
		if (err) {
			cb(err);
			return;
		}
		if (results && results.length) {
			var num = filesMap[filename];
			filesMap[filename] = ++num;
		}
		cb(null);
	});
};

daemon.prototype.startSchedule = function() {
	var self = this;
	schedule.scheduleJob({
		start: Date.now(),
		period: FLUSH_INTERVAL
	}, doScheduleJob, self);
}

var doScheduleJob = function(self) {
	var mutex = self.mutex;
	if (mutex === MUTEX_LOCK) {
		logger.warn('flush dataQueue is running, waiting...')
		return;
	}

	mutex = MUTEX_LOCK;
	if(process.env.debug)
		logger.info('flush dataQueue start %j', self.dataQueue.length);
	var i = 0;
	var j = 1;
	async.whilst(
		function() {
			return i < j;
		},
		function(callback) {
			if(process.env.debug)
				logger.info(self.dataQueue.length);	
			if (self.dataQueue && self.dataQueue.length) {
				var t = self.dataQueue.shift();
				var filename = t['filename'];
				var data = t['data'];
				self.insertMessage(filename, data, function(err) {
					if (err) {
						self.dataQueue.push(t);
					}
					callback(null);
				});
			} else {
				i = j;
				callback(null);
			}
		},
		function() {
			self.mutex = MUTEX_FREE;
			if(process.env.debug)
				logger.info('flush dataQueue done');
		}
	);
}

daemon.prototype.addQueue = function(filename, data) {
	if(process.env.debug)
		logger.info('addQueue %j %j', filename, data);
	this.dataQueue.push({
		data: data,
		filename: filename
	});
}

daemon.prototype.addTailFile = function(filepath, filename) {
	var self = this;
	if (this.tailMap[filename]) {
		return;
	}

	var Tail = require('tail').Tail;
	var tail = new Tail(filepath);
	this.tailMap[filename] = tail;

	tail.on("line", function(data) {
		self.addQueue(filename, data);
	});
}

var startsWith = function(str, prefix) {
	if (typeof str !== 'string' || typeof prefix !== 'string' ||
		prefix.length > str.length) {
		return false;
	}

	return str.indexOf(prefix) === 0;
};

var setWriteLine = function(filename, line) {
	if (!fs.existsSync(tmpFile)) {
		fs.writeFileSync(tmpFile, filename + ':' + line + '\n');
	} else {
		var str = fs.readFileSync(tmpFile).toString();
		var flag = false;
		//clear content
		fs.writeFileSync(tmpFile, '');
		var lines = str.split('\n');
		for (var i = 0; i < lines.length; i++) {
			if (lines[i].indexOf(':') < 0)
				continue;
			var name = lines[i].split(':')[0];
			if (filename == name) {
				flag = true;
				fs.appendFileSync(tmpFile, filename + ':' + line + '\n');
			} else {
				fs.appendFileSync(tmpFile, lines[i] + '\n');
			}
		}
		if (!flag) {
			fs.appendFileSync(tmpFile, filename + ':' + line + '\n');
		}
	}
};

var getReadLine = function(filename) {
	var str = fs.readFileSync(tmpFile).toString();
	var lines = str.split('\n');
	for (var i = 0; i < lines.length; i++) {
		if (lines[i].indexOf(':') < 0)
			continue;
		var name = lines[i].split(':')[0];
		if (filename === name) {
			return lines[i].split(':')[1];
		}
	}
	return 0;
};

var getTotalLine = function(file) {
	var str = fs.readFileSync(file).toString();
	var lines = str.split('\n');
	var count = lines.length - 1;
	if (count < 0)
		return 0;
	return count;
}

var syncToMongo = function(dir, files, self, cb) {
	var i = 0;
	async.whilst(
		function() {
			return i < files.length;
		},
		function(callback) {
			var filename = files[i];
			var filepath = dir + filename;
			var count = getReadLine(filename);

			filesMap[filename] = count;
			syncFileToMongo(filepath, filename, count, self, function() {
				self.addTailFile(filepath, filename);
				i++;
				callback(null);
			});
		},
		function(err) {
			cb(err, 'done');
		}
	);
}

var syncFileToMongo = function(filepath, filename, from, self, cb) {
	if(process.env.debug)
		logger.info('start sync file %j', filename);
	var now = 1;
	var pipe = es.pipeline(
		fs.createReadStream(filepath, {
			flags: 'r'
		}),
		es.split(),
		es.through(function write(data) {
				this.emit('data', data)
			},
			function end() { //optional
				this.emit('end')
			})
	)

	pipe.on('data', function(data) {
		pipe.pause();
		if (now < from) {
			pipe.resume();
		} else {
			self.insertMessage(filename, data, function(err) {
				pipe.resume();
			});
		}
	});

	pipe.on('end', function() {
		setWriteLine(filename, filesMap[filename]);
		if(process.env.debug)
			logger.info('%j end write line %j', filename, filesMap[filename]);
		cb(null);
	});
}

var mutexConsts = {
	"MUTEX_FREE": 1,
	"MUTEX_LOCK": 2
}