/**
 * Created by prashant on 8/1/17.
 */
'use strict';
//create logger
//var log = require('../../utils/logger.js');
//var logger = log.getLogger();

//response formatter
//response formatter
var responseFormatter = require('Utils/responseformatter.js');

//we are using redis
//var redis = require('redis');

var TIME_TO_LIVE = 60*60*24; //24 hours

//initialize redis connection
/*var client = redis.createClient('6379', 'localhost', {no_ready_check: true});

 client.auth('_;|;=3^;I~._~*8;x%|2Y%3*t;TNP*Z4:4*:X;~3=!~X~7.|0!54z7_;-!|||*9L', function (err) {
 if (err) {
 throw err;
 }
 });

 client.on('connect', function() {
 logger.info('******** Connected to Redis *************');
 });*/

module.exports={};

module.exports.store = function(key, value, callback, ttl){
    responseFormatter.formatServiceResponse({'key':key}, callback);
    /*client.set(key, JSON.stringify(value), function(err, reply) {


     if (reply) {
     //set an expiry time so that data is removed automatically
     var timeToLive = ttl || TIME_TO_LIVE;
     client.expire(key, timeToLive, function(err, reply) {
     if (reply) {
     //return the key back if successfull
     responseFormatter.formatServiceResponse({'key':key}, callback);
     }
     else {
     logger.error("Failed to expire token. Error: ", err);
     responseFormatter.formatServiceResponse(new Error('Expiration not set on redis'), callback);
     }
     });
     }
     else {
     logger.error("Failed to set token. Error: ", err);
     responseFormatter.formatServiceResponse(new Error('Unable to save token in redis'), callback);
     }
     });*/

}

module.exports.remove = function(key, callback){
    responseFormatter.formatServiceResponse({'key':key}, callback);

    /*client.exists('key', function(err, reply) {
     if (reply === 1) {
     client.del(key, function(err, reply) {
     if (reply) {
     responseFormatter.formatServiceResponse({'key':key}, callback);
     }
     else {
     logger.error("Failed to remove token. Error: ", err);
     responseFormatter.formatServiceResponse(new Error('Unable to remove token'), callback);
     }
     });
     } else {
     logger.debug('Key does not exist');
     responseFormatter.formatServiceResponse({'key':key}, callback);
     }
     });*/


}

module.exports.get = function(key, callback){
    responseFormatter.formatServiceResponse({key:key}, callback);
    /*client.get(key, function(err, userData) {
     if (userData != null){
     responseFormatter.formatServiceResponse(JSON.parse(userData), callback);
     }
     else{
     //for now treat all errors as authentication errors
     logger.error("Failed to find token. Error: ", err);
     responseFormatter.formatServiceResponse(new Error('Token not found'), callback);
     }
     });*/

}
