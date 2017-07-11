/**
 * Created by cl-macmini-63 on 1/21/17.
 */

'use strict';

//load node modules
const Boom = require('boom');
const Joi = require('joi');

//create logger
const log = require('Utils/logger.js');
const logger = log.getLogger();

const masterServiceHandler = require( 'handler/config/masterservicehandler.js' );

const masterServiceSchema = require('schema/mongo/masterserviceschema');
const HttpErrors = require('Utils/httperrors.js');

module.exports={};



module.exports.register = function(server, options, next) {

    server.route([
        {
            method: 'POST',
            path: '/admin/masterservice',
            config: {
                auth: 'token2' ,
                handler: masterServiceHandler.createMasterServices,
                //swagger related
                description: 'create master services ',
                notes: 'return new created master service',
                tags: ['api'],
                payload:{
                    maxBytes: 5000000,
                    parse: true,
                    output: 'file',
                    allow: 'multipart/form-data'
                },
                plugins: {
                    'hapi-swagger': {
                        payloadType:'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    payload: {
                        service_name: Joi.string().required(),
                        service_icon: Joi.any()
                            .meta({swaggerType: 'file'})
                            .required()
                            .description('image file'),
                        description: Joi.string().optional().allow('')
                    },
                    headers: {
                        Authorization : Joi.string().description('access token is required.')
                    },
                    options: {
                        abortEarly:false, allowUnknown:true
                    }
                }
            }
        },
        {
            method: 'GET',
            path: '/admin/masterservices',
            config: {
                auth: 'token2',
                handler: masterServiceHandler.getMasterServices,
                //swagger related
                description: 'Get list of all master services',
                notes: 'Returns data of all master services depending upon filter provided as querystring',
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    headers: {
                        Authorization : Joi.string().description('access token is required.')
                    },
                    options: {
                        abortEarly:false, allowUnknown:true
                    }
                }
            }
        },
        {
            method: 'PUT',
            path: '/admin/masterservices',
            config: {
                auth: 'token2',
                handler: masterServiceHandler.updateMasterService,
                //swagger related
                description: 'Update Master Service || Testing Via Postman Only',
                notes: 'Updates Master Service identified by the service_id passed in payload',
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        payloadType:'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                payload:{
                    maxBytes: 5000000,
                    parse: true,
                    output: 'file',
                    allow: 'multipart/form-data'
                },
                validate: {
                    payload: masterServiceSchema.MasterServiceJoiPutSchema,
                    headers: {
                        Authorization : Joi.string().description('access token is required.')
                    },
                    options: {abortEarly:false, allowUnknown:true,}
                },
            }
        },
        {
            method: 'PUT',
            path: '/admin/masterservices/activate',
            config: {
                auth: 'token2',
                handler: masterServiceHandler.activateMasterService,
                //swagger related
                description: 'Activate / Deactivate Master Service',
                notes: 'Activate or Deactivate Master Service identified by the service_id and is_active param passed in payload',
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        payloadType:'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    payload :{
                        service_id : Joi.string().required(),
                        is_active : Joi.bool().required(),
                    },
                    headers: {
                        Authorization : Joi.string().description('access token is required.')
                    },
                    options: {abortEarly:false, allowUnknown:true,}
                },
            }
        },



        /*,
        {
            method: 'POST',
            path: '/admin',
            config:{
                auth: false,
                handler: adminHandler.createAdmin,
                //swagger related
                description: 'Create Admin',
                notes: 'Create a new Admin',
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    payload: adminSchema.AdminJoiPostSchema,
                    headers: Joi.object().unknown(),
                    options: {
                        abortEarly:false, allowUnknown:true
                    }
                },
            }
        },*/
    ])

    next();
}


module.exports.register.attributes = {
    name: 'futrun-master-service-module',
    version: '0.0.1'
};