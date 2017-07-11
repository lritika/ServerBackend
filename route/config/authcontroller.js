/**
 * Created by cl-macmini-63 on 1/16/17.
 */
'use strict';


const HttpErrors = require('Utils/httperrors.js');
const authHandler = require( 'handler/config/authhandler.js' );
const Joi = require('joi');
let userSchema = require('schema/mongo/userschema')

module.exports={};

module.exports.register = function(server, options, next) {

    server.route([
        {
            method: 'POST',
            path: '/auth/login',
            config: {
                auth: false ,
                handler: authHandler.authenticateUser,
                //swagger related
                description: 'Authenticate user',
                notes: 'Returns User object if user id and password are valid',
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        payloadType:"form",
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    payload: {
                        email: Joi.string()
                            .optional().allow('').description("use this field as common for Entering one of either Email or Phone"),
                        password: Joi.string().optional().allow(''),
                        fb_id   : Joi.string().description('facebook id'),
                        current_role: Joi.string()
                            .required()
                            .description('current role is required'),
                        app_version : Joi.string()
                            .required(),
                        device_token: Joi.string().required(),
                        device_type : Joi.string().valid('IOS','ANDROID').required(),           // IOS or ANDROID
                        time_zone   : Joi.number()


                    },
                    headers: Joi.object().unknown()
                }
            }
        },
        {
            method: 'GET',
            path: '/auth/tokenLogin',
            config: {
                auth: 'token1' ,
                handler: authHandler.accessTokenLogin,
                //swagger related
                description: 'Authenticate user',
                notes: 'Returns User object if user id and password are valid',
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        //payloadType:"form",
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    query: {
                        app_version : Joi.string().optional().allow(''),
                        device_token: Joi.string().optional().allow(''),
                        device_type : Joi.string().valid('IOS','ANDROID'),           // IOS or ANDROID
                        time_zone   : Joi.string().optional().allow('')
                    },
                    headers:Joi.object({authorization: Joi.string().required()}).unknown()
                    //headers: Joi.object().keys({authorization:Joi.string()}).unknown()
                }
            }
        },
        {
            method: 'POST', //angular plugin requires a DELETE method for signout
            path: '/auth/signout',
            config: {
                auth: 'token1' ,
                handler: authHandler.signout,
                //swagger related
                description: 'Logs out the user',
                notes: 'Logs out the user and clears the device token from authentication token',
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate:{
                    headers: {
                        authorization : Joi.string().description('access token is required.')
                    },
                    options: {
                        abortEarly:false, allowUnknown:true
                    }
                }

            }
        },
        {
            method: 'POST', 
            path: '/auth/switch',
            config: {
                auth: 'token1' ,
                handler: authHandler.switchProfile,
                //swagger related
                description: 'Switch Profile',
                notes: 'Seeker can change to Provider and Provider can chnage to Seeker',
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate:{
                    headers: {
                        authorization : Joi.string().description('access token is required.')
                    },
                    options: {
                        abortEarly:false, allowUnknown:true
                    }
                }

            }
        },
        /*{
            method: 'POST', //angular plugin requires a DELETE method for signout
            path: '/auth/token/validate',
            config: {
                //auth: 'token' ,
                handler: validate,
                //swagger related
                description: 'Validates auth token',
                notes: 'Token should be passed in security header in Bearer form ("Bearer  authToken") in authorization header. Payload is ignored ',
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },

            }
        }*/
    ]);
    next();
}

module.exports.register.attributes = {
    name: 'futrun-auth-module',
    version: '0.0.1'
};
