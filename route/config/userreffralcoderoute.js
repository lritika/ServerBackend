/**
 * Created by clicklabs on 6/22/17.
 */

'use strict'
const Joi = require('joi');

//create logger
const log = require('Utils/logger.js');
const logger = log.getLogger();

const userReffralCodeHandler = require( 'handler/config/userreffralcodehandler.js' );
const HttpErrors = require('Utils/httperrors.js');

module.exports.register = function(server, options, next) {

    server.route([
        {
            method: 'POST',
            path: '/reffralcode',
            config: {
                auth: false,
                handler: userReffralCodeHandler.createReffralCode,
                //swagger related
                description: 'Create Reffral Code for User',
                notes: 'Create Reffral Code for User',
                tags: ['api','reff'],
                plugins: {
                    'hapi-swagger': {
                        payloadType: 'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    payload: {
                        user_id : Joi.string()
                        },
                    headers: {
                        Authorization : Joi.string().description('User access token is required.')
                    },
                    options: {abortEarly: false, allowUnknown: true}
                    }
            }
        },
        {
            method: 'POST',
            path: '/reffralcode/apply',
            config: {
                auth: false,
                handler: userReffralCodeHandler.applyReffralCode,
                //swagger related
                description: 'Apply Reffral Code for User at signup',
                notes: 'Apply Reffral Code for User at signup',
                tags: ['api','reff'],
                plugins: {
                    'hapi-swagger': {
                        payloadType: 'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    payload: {
                        user_id     : Joi.string(),
                        reff_code   : Joi.string(),
                        reg_as      : Joi.string().valid('SEEKER' , 'PROVIDER').required(),
                    },
                    headers: {
                        //Authorization : Joi.string().description('User access token is required.')
                    },
                    options: {abortEarly: false, allowUnknown: true}
                }

            }

        }
    ])

    next();
}


module.exports.register.attributes = {
    name: 'futrun-reffralcode-module',
    version: '0.0.1'
};