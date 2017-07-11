'use strict'
const log = require('Utils/logger.js');
const logger = log.getLogger();

const mongoose = require('mongoose');
const joi = require('joi');

//const uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;


//mongoose schema
let favouriteSchema = mongoose.Schema({
    user_id     : String,
	gig_id      : {type:Array,default:[]},
	service_id  : String

},
{
        collection : 'userfavourites'
    }
    );
module.exports.Favourites = mongoose.model('favourites', favouriteSchema);