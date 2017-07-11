/**
 * Created by clicklabs on 6/20/17.
 */

'use strict'

var mongoose = require('mongoose');
//mongoose schema
var supportSchema = mongoose.Schema({
        about_us    :String,
        contact_us  : {
            mail   : String,
            address: {
                Address1 :String,
                Address2 :String,
                City     :String,
                State    :String,
                ZipCode  :String,
                Country  :String
            },
            phone  : {type: String, default: null},
            country_code: {type: String, default: null}
        },
        faqs:[{
            question  : String,
            answer    : String
        }]
    },
    {
        collection : 'supports'
    }
);

module.exports.Support = mongoose.model('Support', supportSchema,'supports');