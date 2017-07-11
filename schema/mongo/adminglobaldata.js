/**
 * Created by cl-macmini-149 on 03/05/17.
 */


'use strict'

var mongoose = require('mongoose');
//mongoose schema
var adminGlobalDataSchema = mongoose.Schema({
        eta : {
            priority  : Number,
            is_active : {type: Boolean , default : true},
            eta_priority_ranges : [

                    /*{
                        min     : Number,
                        max     : Number,
                        weight  : Number,
                    },
                    {
                        min     : Number,
                        max     : Number,
                        weight  : Number,
                    },
                    {
                        min     : Number,
                        max     : Number,
                        weight  : Number,
                    },
                    {
                        min     : Number,
                        max     : Number,
                        weight  : Number,
                    },
                    {
                        min     : Number,
                        max     : Number,
                        weight  : Number,
                    },
                    {
                        min     : Number,
                        max     : Number,
                        weight  : Number,
                    }*/
                ]
        },
        price   : {
            priority : Number,
            total_weight : Number,
            is_active : {type: Boolean , default : true}
        },
        skill_level : {
            priority  : Number,
            is_active : {type: Boolean , default : true},
            skill_priority_ranges : [
                /*{
                    name   : String,
                    weight : Number,
                },
                {
                    name   : String,
                    weight : Number,
                },
                {
                    name   : String,
                    weight : Number,
                }*/
            ]
        },
        rating : {
            priority : Number,
            is_active : {type: Boolean , default : true},
            total_weight : Number,
            //rating_priority_ranges : [
                /*{
                    min     : Number,
                    max     : Number,
                    weight  : Number,
                },
                {
                    min     : Number,
                    max     : Number,
                    weight  : Number,
                },
                {
                    min     : Number,
                    max     : Number,
                    weight  : Number,
                },
                {
                    min     : Number,
                    max     : Number,
                    weight  : Number,
                },
                {
                    min     : Number,
                    max     : Number,
                    weight  : Number,
                }*/
           // ]
        },
        job_acceptance : {
            priority : Number,
            is_active : {type: Boolean , default : true},
            total_weight : Number,
            //job_acceptance_priority_ranges : [
                /*{
                    min     : Number,
                    max     : Number,
                    weight  : Number,
                },
                {
                    min     : Number,
                    max     : Number,
                    weight  : Number,
                },
                {
                    min     : Number,
                    max     : Number,
                    weight  : Number,
                },
                {
                    min     : Number,
                    max     : Number,
                    weight  : Number,
                },
                {
                    min     : Number,
                    max     : Number,
                    weight  : Number,
                }*/
            //]
        },
    filter_radius   : {type : Number , default : 50}
    },
    {
        collection : 'adminglobaldata'
    }
);

module.exports.AdminGlobalData = mongoose.model('AdminGlobalData', adminGlobalDataSchema,'adminglobaldata');