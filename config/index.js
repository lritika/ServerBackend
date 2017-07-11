'use strict';
let config = {};
//var mongoose = require( 'mongoose' );
let myEnv = process.env.NODE_ENV.toLowerCase();
//let mysql = require("mysql");
//let myRedis;
let dbConnection;
//let RedisModule = require('ioredis');
//let redisConfig = require('config/redis.' + myEnv);
//const winston = require('winston');
const fs = require('fs');
const logDir = 'log';
//if (!fs.existsSync(logDir)) {
//    fs.mkdirSync(logDir);
//}
const tsFormat = () => (new Date()).toLocaleTimeString();
/*const myLogger = new (winston.Logger)({
    transports: [
        // colorize the output to the console
        new (winston.transports.Console)({
            timestamp: tsFormat,
            colorize: true,
            level: myEnv === 'development' ? 'silly' : 'info'
        }),
        new (require('winston-daily-rotate-file'))({
            filename: `${logDir}/-results.log`,
            timestamp: tsFormat,
            datePattern: 'yyyy-MM-dd',
            prepend: true,
            level: myEnv === 'development' ? 'silly' : 'info'
        })
    ]
});*/
//config.myLogger = myLogger;
//config.auth = require('config/auth.' + myEnv);
//config.db = require('config/db.' + myEnv);
config.constants = require('config/appConstants.' + myEnv);
config.amazon = require('config/aws.' + myEnv);
config.shopping = require('config/payment.' + myEnv);
//config.redis = redisConfig;
config.socket = require('config/socket.' + myEnv);
config.messages=require('./messages')
//config.messenger=require('messengerconfig.'+myEnv)

/*if (process.env['REDIS_USE_UNIX_DOMAIN_SOCKET'] === 'true') {
    myRedis = new RedisModule(redisConfig.redisUniXSocketPath);
}*/
/*if (process.env['REDIS_USE_TCP'] === 'true') {
    myRedis = new RedisModule(redisConfig.redisTcpConfig)
}*/

/*let initConnectionToMySQL = function (dbConfig) {
    //dbConnection = mysql.createConnection(dbConfig);
    mongoose.connect(dbConfig.URI);
    // Recreate the connection, since
    // the old one cannot be reused.

    // Setup connection events
// When successfully connected
    mongoose.connection.on('connected', function () {
        myLogger.info('Mongoose default connection open to ' , dbConfig);
    });

// If the connection throws an error
    mongoose.connection.on('error',function (err) {
        myLogger.error('Error opening database connection: ' + err);
        throw err;
    });

// When the connection is disconnected
    mongoose.connection.on('disconnected', function () {
        myLogger.error('Connection to ' , dbConfig , ' closed.');
    });

// If the Node process ends, close the Mongoose connection
    process.on('SIGINT', function() {
        mongoose.connection.close(function () {
            myLogger.error('DB connection closed through app termination');
        });
        process.exit(1);
    });
};*/

//initConnectionToMySQL(config.db.mongoConfig);

/*const keepDBConnectionAlive = function () {
    dbConnection.query('SELECT 1',
        function (err, rows) {
            if (err) {
                myLogger.error('ERROR in query SELECT 1', err);
            } else {
                myLogger.info(rows);
            }
        });
};*/
/*setInterval(function () {
    keepDBConnectionAlive();
}, 60000);
config.mySqlConnection = dbConnection;*/
/*config.myRedisConnection = myRedis;
myRedis.set("TEST_REDIS_KEY", "TEST_REDIS_VALUE");
myRedis.get("TEST_REDIS_KEY", function (e, v) {
    if (e) {
        myLogger.error("Connection to Redis failed", e);
    }
    if (v && v == "TEST_REDIS_VALUE") {
        myLogger.info("Connected to Redis");
    } else {
        myLogger.error("Connection to Redis failed", e);
    }
});*/
//    { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }

// logger.debug('Debugging info');
// logger.verbose('Verbose info');
// logger.info('Hello world');
// logger.warn('Warning message');
// logger.error('Error info');
module.exports = config;

