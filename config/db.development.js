'use strict';

const mysqlConfig = {
	host :               'localhost' ,
	database :           'flowburDevelopment' ,
	password :           'dixit.sharma@click-labs.com' ,
	user :               'root' ,
	debug :              false ,
	port :               3306 ,
	multipleStatements : true
};

var mongoDatabase = null;
var env = environment || "Dev";
if (env == "production") {
	mongoDatabase = process.env.MONGO_DBNAME_LIVE
} else {
	if (env == "testing") {
		mongoDatabase = process.env.MONGO_DBNAME_TEST
	} else {
		if (env == "development") {
			mongoDatabase = process.env.MONGO_DBNAME_DEV || 'futran-dev'
		}
	}
}
var mongoPort = process.env.port || 27017,
	mongoHost = 'localhost',
	mongoUserPass = process.env.MONGO_USER && process.env.MONGO_PASS ? process.env.MONGO_USER + ":" + process.env.MONGO_PASS + "@" : '';

var mongo = {
	URI: "mongodb://" + mongoUserPass + mongoHost + ":" + mongoPort + "/" + mongoDatabase,
	port: 27017,
	database: mongoDatabase
};



module.exports    = {
	mongoConfig : mongo
};