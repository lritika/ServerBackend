/**
 * Created by cl-macmini-63 on 2/1/17.
 */


'use strict'

var mongoose = require('mongoose');
//mongoose schema
var cardSchema = mongoose.Schema({
        card_id			: String,
        card_name       : String,
        card_type       : String,
        card_fields     : {type: Array},
        is_active       : {type : Boolean , default : true},
        icon: {
            original: {type: String, default: null},
            thumbnail: {type: String, default: null}
        },
    },
    {
        collection : 'cards'
    }
);

module.exports.Card = mongoose.model('Card', cardSchema,'cards');