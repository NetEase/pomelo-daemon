var MongoClient = require('mongodb').MongoClient;

var format = require('util').format;
var obj = {
	"host": "localhost",
	"port": 27017,
	"username": "pomelo",
	"password": "pomelo",
	"database": "test",
	"collection": "cpomelo"
};

var url = format("mongodb://%s:%s@%s:%s/%s", obj.username, obj.password, obj.host, obj.port, obj.database);
console.log(url);

MongoClient.connect(url, function(err, db) {
	if(err){
		throw err;
	}
});