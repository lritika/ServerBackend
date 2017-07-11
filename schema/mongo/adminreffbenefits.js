/**
 * Created by clicklabs on 6/22/17.
 */

'use strict';

//create logger
const log = require('Utils/logger.js');
const logger = log.getLogger();

const mongoose = require('mongoose');
const joi = require('joi');
let adminRefferalBenefitsSchema = mongoose.Schema({
        provider_benifits_for_referrer : {
            provider_id : String,
            benefits	: Number
        },
        provider_benifits_for_referee : {
            provider_id : String,
            benefits	: Number
        },
        seeker_benifits_for_referrer : {
            seeker_id : String,
            benefits	: Number
        },
        seeker_benifits_for_referee : {
            seeker_id : String,
            benefits	: Number
        }
    },
    {
        collection : 'adminreffbenefits'
    }
)

module.exports.AdminRefferalbenefit = mongoose.model('AdminRefferalbenefit', adminRefferalBenefitsSchema,'adminreffbenefits');
