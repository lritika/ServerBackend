/**
 * Created by cl-macmini-63 on 1/10/17.
 */

'use strict';

//load node modules
const Boom = require('boom');
const Joi = require('joi');

//create logger
const log = require('Utils/logger.js');
const logger = log.getLogger();

const adminHandler = require( 'handler/config/adminhandler.js' );
const cardHandler= require( 'handler/config/cardhandler.js' );
const gigHandler = require( 'handler/config/gigHandler.js' );

const adminSchema = require('schema/mongo/adminschema');

const HttpErrors = require('Utils/httperrors.js');

module.exports={};



module.exports.register = function(server, options, next) {

    server.route([
        {
            method: 'POST',
            path: '/admin/auth/login',
            config: {
                auth: false ,
                handler: adminHandler.authenticateAdmin,
                //swagger related
                description: 'Authenticate admin',
                notes: 'Returns Admin object if email and password are valid',
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    payload: {
                        email: Joi.string()
                            .required()
                            .description('email is required'),
                        password: Joi.string()
                            .required()
                            .description('Password is required'),
                        current_role: Joi.string()
                            .required()
                            .description('current role is required')
                            .valid('ADMIN')

                    },
                    headers: Joi.object().unknown()
                }
            }
        },
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
        },
        {
            method:'POST',
            path:'/admin/codes',
            config:{
                auth:false,
                handler:adminHandler.addCodesHandler,
                //swagger
                description:'Add State/Province codes',
                notes: 'Add State Province Admin task',
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        payloadType:'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    payload: {
                        place:Joi.string().required(),
                        code:Joi.string().required(),
                        placeType:Joi.string().valid(["State","Province","Union Territory"]).required(),
                        country:Joi.string().required(),
                    },
                    options: {
                        abortEarly:false, allowUnknown:true
                    }
                },
            }
        },
        {
            method:'POST',
            path:'/admin/constants',
            config:{
                auth:false,
                handler:adminHandler.addConstantHandler,
                description:'add booking time in millisecond',
                notes: 'add booking time',
                tags: ['api'],
                plugins:{
                    'hapi-swagger':{
                        payloadType:'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate:{
                    payload:{
                        booking_timer: Joi.number().description('time should be in millisecond'),
                        credit_value : Joi.number().description('Credit value is number of dollors which will make 1 Credit')
                    },
                    options:{
                         abortEarly:false, allowUnknown:true
                    }
                },

            }

        },
        {
            method:'PUT',
            path:'/admin/constants',
            config:{
                auth:false,
                handler:adminHandler.updateConstantHandler,
                description:'Update constants',
                notes: 'update always',
                tags: ['api'],
                plugins:{
                    'hapi-swagger':{
                        //payloadType:'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate:{
                    payload:{
                        constants_id:Joi.string().required(),
                        booking_timer:Joi.number().description('update time - should be in millisecond'),
                        credit_value : Joi.number().description('Update Credit value - is number of dollors which will make 1 Credit')
                    },
                    options:{
                        abortEarly:false, allowUnknown:true
                    }
                },

            }

        },
        
        {
            method:'GET',
            path:'/admin/constants',
            config:{
                auth:false,
                handler:adminHandler.getConstantHandler,
                description:'get constants value set by admin',
                notes: 'get constants value set by admin',
                tags: ['api'],
                plugins:{
                    'hapi-swagger':{
                        payloadType:'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate:{
                    options:{
                        abortEarly:false, allowUnknown:true
                    }
                },

            }
        },
        {
            method:'GET',
            path:'/admin/codes',
            config:{
                auth:false,
                handler:adminHandler.getCodesHandler,
                //swagger
                description:'Add State/Province codes',
                notes: 'Add State Province Admin task',
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        payloadType:'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    options: {
                        abortEarly:false, allowUnknown:true
                    }
                },
            }
        },
        {
            method:'GET',
            path:'/admin/codes/maps',
            config:{
                auth:false,
                handler:adminHandler.getMappedCodes,
                //swagger
                description:'Add State/Province codes',
                notes: 'Add State Province Admin task',
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        payloadType:'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    options: {
                        abortEarly:false, allowUnknown:true
                    }
                },
            }
        },
        //{
        //    method:'PUT',
        //    path:'/admin/codes',
        //    config:{
        //        auth:false,
        //        handler:adminHandler.updateCodesHandler,
        //        //swagger
        //        description:'Update State/Province codes',
        //        notes: 'Update State Province Admin task',
        //        tags: ['api'],
        //        plugins: {
        //            'hapi-swagger': {
        //                payloadType:'form',
        //                responseMessages: HttpErrors.standardHTTPErrors
        //            }
        //        },
        //        validate: {
        //            payload: {
        //                place:Joi.string().optional().allow('').description("use Standard Google "),
        //                code:Joi.string().optional().allow('').description("use Standard Google "),
        //                placeType:Joi.string().valid(["State","Province"]).optional().allow(''),
        //                country:Joi.string().optional().allow('').description("use Standard Google "),
        //            },
        //            options: {
        //                abortEarly:false, allowUnknown:true
        //            }
        //        },
        //    }
        //},

        {
            method: 'GET',
            path: '/admin/cards',
            config: {
                auth: 'token2',
                handler: cardHandler.getCards,
                //swagger related
                description: 'Get list of all profile cards',
                notes: 'Returns data and fields of all profile cards depending upon filter provided as querystring',
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
            method: 'GET',
            path: '/admin/seekers',
            config: {
                auth: 'token2',
                handler: adminHandler.getAllSeekers,
                //swagger related
                description: 'Get list of all users whose role is SEEKER',
                notes: 'Returns data and fields of all Seekers',
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    headers: {
                        Authorization : Joi.string().description('Admin access token is required.')
                    },
                    options: {
                        abortEarly:false, allowUnknown:true
                    }
                }
            }
        },
        {
            method: 'GET',
            path: '/admin/providers',
            config: {
                auth: 'token2',
                handler: adminHandler.getAllProviders,
                //swagger related
                description: 'Get list of all users whose role is PROVIDER',
                notes: 'Returns data and fields of all Providers',
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    headers: {
                        Authorization : Joi.string().description('Admin access token is required.')
                    },
                    options: {
                        abortEarly:false, allowUnknown:true
                    }
                }
            }
        },
        {
            method: 'GET',
            path: '/admin/user/{user_id}',
            config: {
                auth: 'token2',
                handler: adminHandler.getUserDetailsByUserId,
                //swagger related
                description: 'Get User Details by user id',
                notes: 'Get User Details by user id ',
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    params : {
                        user_id : Joi.string().required().description(
                            'user_id is required.'),
                    },
                    headers: {
                        Authorization : Joi.string().description('Admin access token is required.')
                    },
                    options: {
                        abortEarly:false, allowUnknown:true
                    }
                }
            }
        },
        {
            method: 'PUT',
            path: '/admin/user/wallet',
            config: {
                auth: 'token2',
                handler: adminHandler.AddOrDeductWalletAmountByUserId,
                //swagger related
                description: 'Add/Deduct users wallet amount',
                notes: 'Add/Deduct users wallet amount.Make add_flag true if you want to add money.If you want to deduct money make deduct_flag true',
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    payload: {
                        user_id: Joi.string().required().description(
                            'user_id is required.'),
                        amount: Joi.string().required().description(
                            'amount is required.This amount is number of CREDITS'),
                        add_flag: Joi.bool().required(),
                        deduct_flag: Joi.bool().required()
                    },
                    headers: {
                        Authorization: Joi.string().description('Admin access token is required.')
                    },
                    options: {
                        abortEarly: false, allowUnknown: true
                    }
                }
            },
        },
        {
            method: 'PUT',
            path: '/admin/provider/approve',
            config: {
                auth: 'token2',
                handler: adminHandler.approveProviderByProfileId,
                //swagger related
                description: 'Approve Provider profile by Admin',
                notes: 'Approve Provider profile by Admin',
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    payload : {
                        profile_id : Joi.string().required().description(
                            'profile_id is required.')
                    },
                    headers: {
                        Authorization : Joi.string().description('Admin access token is required.')
                    },
                    options: {
                        abortEarly:false, allowUnknown:true
                    }
                }
            }
        },
        {
            method: 'PUT',
            path: '/admin/user/activate',
            config: {
                auth: 'token2',
                handler: adminHandler.changeUserStatusByUserId,
                //swagger related
                description: 'Change User status by user id. Make it active or inactive',
                notes: 'Change User status by user id. Make it active or inactive',
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    payload : {
                        user_id : Joi.string().required().description(
                            'user_id is required.'),
                        is_active:Joi.bool().required()
                    },
                    headers: {
                        Authorization : Joi.string().description('Admin access token is required.')
                    },
                    options: {
                        abortEarly:false, allowUnknown:true
                    }
                }
            }
        }
    ])
    
    next();
}


module.exports.register.attributes = {
    name: 'futrun-admin-module',
    version: '0.0.1'
};



