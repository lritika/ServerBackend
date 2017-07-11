/**
 * Created by cl-macmini-63 on 2/16/17.
 */


'use strict'

var mongoose = require('mongoose');
//mongoose schema
var SPGigLocationMapperSchema = mongoose.Schema({
        profile_id          : String,
        provider_id         : String,
        gig_id              : String,
        min_hourly_amount   : String,
        discount            : String,
        is_revenue_paid     : {type : Boolean , default: false},
        location            : {
            locationID:String,
            locationName:String
        },
        revenue         : {
            model               :   String,
            value               :   String,
            revenue_model_for   :   String
        },
        pricing : [
            new mongoose.Schema({
            type:String,
            value:String
        })]
    },
    {
        collection : 'SPgiglocationmappings'
    }
);

module.exports.SPGigLocationMapper = mongoose.model('SPGigLocationMapper', SPGigLocationMapperSchema,'SPgiglocationmappings');