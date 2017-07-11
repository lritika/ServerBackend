/**
 * Created by cl-macmini-63 on 2/1/17.
 */


'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//mongoose schema
var userProfileSchema = mongoose.Schema({
        user_id			: String,
        user_email      : String,
        cards           : [{
                card     : {
                    type: Schema.ObjectId,
                    ref: 'Card'},
                fields      : {type : mongoose.Schema.Types.Mixed}
        }]
    },
    {
        collection : 'userprofile'
    }
);

module.exports.UserProfile = mongoose.model('UserProfile', userProfileSchema,'userprofile');