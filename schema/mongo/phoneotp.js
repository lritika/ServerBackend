/**
 * Created by cl-macmini-63 on 1/18/17.
 */

'use strict';

//create logger
var log = require('../../Utils/logger.js');
var logger = log.getLogger();

var mongoose = require('mongoose');
var joi = require('joi');


//mongoose schema
var phoneotpSchema = mongoose.Schema({
        phone			: String,
        countryCode     : String,
        email           : String,
        otp             : String,
        is_verified     : {type : Boolean , default  :false}
        
    },
    {
        collection : 'phoneotp'
    }
);

module.exports.PhoneOtp = mongoose.model('PhoneOtp', phoneotpSchema,'phoneotp');


