/*!
 * pomelo-daemon - load
 * Copyright(c) 2013 fantaysni <fantasyni@163.com>
 * MIT Licensed
 */
 var consts = require('../../config/consts');
 var util = require('../util');
 var instance = null;

 var Loader = function(){
 	this.serverMaps = {};
 	this.pidMap = {}; // serverId -> pid
 	this.daemonKey = {};
 	this.mongoConfig = {};
 }

 module.exports = function(){
 	if(!instance){
 		instance = new Loader();
 	}
 	return instance;
 }

 Loader.prototype.handle = function(name, path){
 	try {
		var json = require(path);
		if(name === 'daemon'){
			this.daemonKey = json;
		} else if(name === 'mongo'){
			this.mongoConfig = json;
		} else {
			this.serverMaps[name] = json;
		}
	} catch (e) {
		var LOAD_ERROR = consts.LOAD_ERROR;
		var COMANDS_LOAD_ERROR = consts.COMANDS_LOAD_ERROR;
		util.log(COMANDS_LOAD_ERROR + ' ' + path);
		util.log(LOAD_ERROR);
		process.exit(0);
		// util.log(LOAD_ERROR);
	}
 }

 Loader.prototype.getServerMaps = function(){
 	return this.serverMaps;
 }

 Loader.prototype.setPidMap = function(serverId, pid){
 	this.pidMap[serverId] = pid;
 }

 Loader.prototype.getPidMapById = function(serverId){
 	return this.pidMap[serverId];
 } 

 Loader.prototype.rmPidMapById = function(serverId){
 	delete this.pidMap[serverId];
 }

 Loader.prototype.getDaemonKey = function(){
 	return this.daemonKey;
 }

 Loader.prototype.getMongoConfig = function(){
 	return this.mongoConfig;
 }