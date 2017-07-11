/**
 * Created by cl-macmini-63 on 1/21/17.
 */

'use strict';

//create logger
const log = require('Utils/logger.js');
const logger = log.getLogger();


const mongoose = require('mongoose');
const joi = require('joi');

const uniqueValidator = require('mongoose-unique-validator');


//mongoose schema
var masterServicesSchema = mongoose.Schema({
        service_id: String,
        service_name: String,
        service_icon: {
            original: {type: String, default: null},
            thumbnail: {type: String, default: null}
        },
        is_favourite: {type: Boolean , default : false},
        is_active: {type: Boolean, default: true},
        description: String
    },
    {
        collection: 'masterservices'
    }
);

//add uniqueness validator as plugin
masterServicesSchema.plugin(uniqueValidator, {message: '{VALUE} already exists.'});


//removing unwanted attribues when sending to front end
masterServicesSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});


//JOI schema, should be same as mongoose schema. Using because HAPI and some plugins like swagger
//internally use JOI
var joiPutSchema = {
    service_name: joi.string(),
    service_id: joi.string().required(),
    
    service_icon: joi.any()
        .meta({swaggerType: 'file'})
        .optional()
        .description('image file'),
    description: joi.string().optional().allow(''),
    
};

var joiPostSchema = {
    service_name: joi.string().required(),
    service_icon: joi.any()
        .meta({swaggerType: 'file'})
        .required()
        .description('image file'),
    description: joi.string().optional().allow('')
};


module.exports.MasterService = mongoose.model('masterservices', masterServicesSchema);
module.exports.MasterServiceJoiPutSchema = joiPutSchema;
module.exports.MasterServiceJoiPostSchema = joiPostSchema;
