/**
 * Created by prashant on 7/1/17.
 */
/**
 * Wrapper log module for logging. Used to pass single logger to all modules.
 * All modules should require this module
 */
'use strict';

var bunyan = require('bunyan');
var logger = bunyan.createLogger(
    {name: "futrun",
        level:"debug",
        streams: [{
            type: 'rotating-file',
            path: 'log/futrun.log',
            period: '1d',   // daily rotation
            count: 3
        },{
            stream: process.stderr
            // `type: 'stream'` is implied
        }]
    }
);



module.exports = {};

//register as plugin
module.exports.register = function(server, options, next) {
    // Callback, completes the registration process
    next();
};

module.exports.register.attributes = {
    name: 'futrun-logger',
    version: '1.0.0'
};

module.exports.getLogger =  function(){
    return logger;
}


