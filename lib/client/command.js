/*!
 * pomelo-daemon - command
 * Copyright(c) 2013 fantaysni <fantasyni@163.com>
 * MIT Licensed
 */

var consts = require('../../config/consts');
var request = require('request');
var util = require('../util');
var cliff = require('cliff');
var fs = require('fs');

var Command = function() {
	this.commands = {};
	this.serverMaps = {};
	this.daemonKey = {};
	this.init();
	this.port = 12306;
	this.rl = null;
	this.env = process.cwd();
}

module.exports = function(){
	return new Command();
}

Command.prototype.init = function() {
	var self = this;
	fs.readdirSync(__dirname + '/commands').forEach(function(filename) {
		if (/\.js$/.test(filename)) {
			var name = filename.substr(0, filename.lastIndexOf('.'));
			var _command = require('./commands/' + name);
			self.commands[name] = _command;
		}
	});
}

Command.prototype.handle = function(argv){
	var rl = this.rl;
	var self = this;
	var argvs = util.argsFilter(argv);
	var comd = argvs[0];
	var comd1 = argvs[1] || "";

	comd1 = comd1.trim();
	var m = this.commands[comd];
	if(m){
		var _command = m();
		_command.handle(self, comd1, argv, rl);
	} else {
		util.errorHandle(argv, rl);
	}
}

Command.prototype.quit = function(){
	this.rl.emit('close');
}

Command.prototype.setEnv = function(env){
	this.env = env;
}

Command.prototype.getEnv = function(){
	return this.env;
}

Command.prototype.setPort = function(port){
	this.port = port;
}

Command.prototype.getPort = function(){
	return this.port;
}

Command.prototype.setRl = function(rl){
	this.rl = rl;
}

Command.prototype.getRl = function(){
	return this.rl;
}