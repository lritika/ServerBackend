    /**
 * Created by prashant on 7/1/17.
 */
/**
 * Initializer module for db connection to mongoDB. Uses mongoose.
 * Once initialzed, mongoose object is available throughout the application using require
 * Mongoose object contains the connection as well
 */
'use strict';

var mongoose = require( 'mongoose' );

var log = require('./logger.js');

var logger = log.getLogger();

/*const config = require("config");

const myLogger = config.myLogger;*/

var dbUrl = 'mongodb://localhost/futrunDB';


//var mongoDatabase = null;
//var env = process.env.NODE_ENV || "development";
//console.log('env : ',env);
//if (env == "Live") {
//    mongoDatabase = process.env.MONGO_DBNAME_LIVE
//} else {
//    if (env == "Test") {
//        mongoDatabase = process.env.MONGO_DBNAME_TEST
//    } else {
//        if (env == "development") {
//            mongoDatabase = process.env.MONGO_DBNAME_DEV || 'futran-dev'
//        }
//    }
//}
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



// Setup connection events
// When successfully connected
mongoose.connection.on('connected', function () {
    logger.info('Mongoose default connection open to ' , mongo);
});

// If the connection throws an error
mongoose.connection.on('error',function (err) {
    logger.info('Error opening database connection: ' + err);
    throw err;
});

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {
    logger.info('Connection to ' , mongo , ' closed.');
});

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', function() {
    mongoose.connection.close(function () {
        logger.error('DB connection closed through app termination');
    });
    process.exit(1);
});

console.log(mongo.URI);
//do the connection
mongoose.connect(mongo.URI);

module.exports={};
