/**
 * Created by clicklabs on 6/20/17.
 */

'use strict'
const Joi = require('joi');

//create logger
const log = require('Utils/logger.js');
const logger = log.getLogger();

const supportHandler = require( 'handler/config/supporthandler.js' );
const HttpErrors = require('Utils/httperrors.js');

module.exports.register = function(server, options, next) {

    server.route([
        {
            method: 'POST',
            path: '/support',
            config: {
                auth: 'token2',
                handler: supportHandler.addSupportInfo,
                //swagger related
                description: 'Add Support Info by Admin',
                notes: 'Add Support Info by Admin',
                tags: ['api','support'],
                plugins: {
                    'hapi-swagger': {
                        payloadType: 'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    payload: {
                        about_us     : Joi.string(),
                        contact_us   : {
                            mail    : Joi.string(),
                            address : {
                                Address1 :Joi.string().optional().allow(''),
                                Address2 :Joi.string().optional().allow(''),
                                City:Joi.string(),
                                State:Joi.string(),
                                ZipCode:Joi.string(),
                                Country:Joi.string()
                            },
                            phone: Joi.string(),
                            country_code:Joi.string()
                        },
                        faqs    : Joi.array().items(Joi.object({
                            question : Joi.string(),
                            answer   : Joi.string()
                        }))
                    },
                    headers: {
                        Authorization : Joi.string().description('Admin access token is required.')
                    },
                    options: {abortEarly: false, allowUnknown: true}
                }
            }
        },
        {
            method:'GET',
            path:"/support",
            config:{
                auth:false,
                handler:supportHandler.getSupportInfo,
                description: 'Get Support Info',
                notes: 'Get Support Info',
                tags: ['api','support'],
                plugins: {
                    'hapi-swagger': {
                        payloadType: 'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    options: {abortEarly: false, allowUnknown: true,}
                }

            }

        }
    ])

    next();
}


module.exports.register.attributes = {
    name: 'futrun-support-module',
    version: '0.0.1'
};