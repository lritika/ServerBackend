/**
 * Created by clicklabs on 6/22/17.
 */

'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//mongoose schema
var userreffralcodeSchema = mongoose.Schema({
        user_id			: String,
        reff_code       : String
    },
    {
        collection : 'userreffralcodes'
    }
);

module.exports.UserReffralCode = mongoose.model('UserReffralCode', userreffralcodeSchema,'userreffralcodes');