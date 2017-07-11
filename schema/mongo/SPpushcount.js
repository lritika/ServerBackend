/**
 * Created by cl-macmini-63 on 2/6/17.
 */


'use strict'

var mongoose = require('mongoose');
//mongoose schema
var SPPushSchema = mongoose.Schema({
        booking_id:String,
        provider_id:String,
        accepted:{type:Boolean,default:false}
    },
    {
        collection : 'SPpushcount'
    }
);

module.exports.SPPush = mongoose.model('SPPush', SPPushSchema,'SPpushcount');
