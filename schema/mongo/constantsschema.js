'use strict';

//create logger
const log = require('Utils/logger.js');
const logger = log.getLogger();

const mongoose = require('mongoose');
const joi = require('joi');
let constantSchema = mongoose.Schema({
	booking_timer : Number,
	credit_value  : Number 				// 1 CREDIT = n$ , So value would be in number od dollors
},
	{
		collection : 'constants'
	}
)

module.exports.constantSchema = mongoose.model('constants', constantSchema);