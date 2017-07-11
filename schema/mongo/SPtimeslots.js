/**
 * Created by cl-macmini-149 on 13/02/17.
 */


'use strict'

var mongoose = require('mongoose');
const Joi = require('joi');
var Schema = mongoose.Schema;
//mongoose schema
var spTimeSlots = mongoose.Schema({
        profile_id:          String,
        provider_id			:String,
        gig_id          : String,
        slots           : [{
            day: String,
            start_time:String,
            end_time:String,
            active:{type:Boolean,default:true}
        }]
    //breaks:[{
    //    day:String,
    //    start_time:String,
    //    end_time:String,
    //}]
    },
    {
        collection : 'SPtimeslots'
    }
);

let joiPostSchema={
    profile_id:                  Joi.string().required(),
    provider_id                 : Joi.string().required(),
    gig_id                       : Joi.string().required(),
    slots       : Joi.array().items(Joi.object({
        day      : Joi.string().required(),
        start_time    : Joi.string().required(),
        end_time    : Joi.string().required(),
        active    : Joi.bool().required(),
    }))
    //breaks            : Joi.array().items(Joi.object({
    //    day  :         Joi.string().required(),
    //    startTime    : Joi.string().required(),
    //    endTime      : Joi.string().required()
    //}))
}



module.exports.spTimeSlots = mongoose.model('SPtimeslots', spTimeSlots);
module.exports.joiPostSchema=joiPostSchema