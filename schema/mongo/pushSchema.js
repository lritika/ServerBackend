'use strict';

//create logger
const log = require('Utils/logger.js');
const logger = log.getLogger();

const mongoose = require('mongoose');
const joi = require('joi');
let pushSchema = mongoose.Schema({
	seeker_id             : String,
    provider_id           : String,
    provider_name   : String,
    seeker_name     : String,
    seeker_image          : {
        original    : {type: String, default: null},
        thumbnail   : {type: String, default: null}
    },
    provider_image        : {
        original    : {type: String, default: null},
        thumbnail   : {type: String, default: null}
    },
    booking_datetime      : String,
    booking_type          : String,
    ODS_type              : String,
    booking_id            : String,
    push_date             : String,
    push_type             : String,
    message               : String,
    is_read               : { type : Boolean , default : false}
    //seeker_name           :String,
    //seeker_device_token   :String,
    //seeker_device_type    :String,

    //gig_id			      : String,
    //gig_name              : String,

    //bid_amount            : String,
    //tools                 : {type:Boolean,default:false},
    //supplies              : {type:Boolean,default:false},
    //description           : String,
    //unit                  : String,
    //quantity              : String,


        //is_seeker_location    :Boolean,
    //virtual_address       :String,
    /*booking_address       :{
        Address1    :String,
        Address2    :String,
        City        :String,
        State       :String,
        ZipCode     :String,
        Country     :String
    },
    booking_latitude    :String,
    booking_longitude   :String,
    booking_address1:{
            Address1 :String,
            Address2 :String,
            City:String,
            State:String,
            ZipCode:String,
            Country:String,
        },
    booking_latitude1:String,
    booking_longitude1:String,
    first_name: {type: String, required: true},
    last_name: {type: String, required: true},*/
    //provider_device_token   :String,
    //provider_device_type    :String
},
	{
		collection : 'push'
	}
)

module.exports.pushSchema = mongoose.model('pushSchema', pushSchema,'push');