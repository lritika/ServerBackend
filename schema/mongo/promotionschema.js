/**
 * Created by clicklabs on 6/15/17.
 */

'use strict';

//create logger
const log = require('Utils/logger.js');
const logger = log.getLogger();

const mongoose = require('mongoose');
const joi = require('joi');

let promotionSchema = mongoose.Schema({
        promo_code      : String,
        gig_id          : String,
        service_id      : String,
        provider_id     : String,
        promo_image        : {
            original    : {type: String, default: null},
            thumbnail   : {type: String, default: null}
        },
        promotion_type       : String,              // percentage or fixed_amount
        promotion_value      : Number,
        valid_from      : Date,
        valid_upto      : Date,
        no_of_coupons   : Number,
        count_remaining : Number,
        is_active       : {type: Boolean , default: true}
    },
    {
        collection : 'promotions'
    }
)

module.exports.Promotion = mongoose.model('Promotion', promotionSchema,'promotions');