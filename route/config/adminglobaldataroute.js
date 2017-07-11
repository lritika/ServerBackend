/**
 * Created by cl-macmini-149 on 03/05/17.
 */

'use strict'
const Boom = require('boom');
const Joi = require('joi');

//create logger
const log = require('Utils/logger.js');
const logger = log.getLogger();

var adminGlobalDataHandler= require( 'handler/config/adminglobaldatahandler.js' );

const HttpErrors = require('Utils/httperrors.js');

module.exports={};
module.exports.register = function(server, options, next) {

    server.route([
        {

            method: 'POST',
            path: '/admin/globaldata',
            config: {
                auth: false,
                handler: adminGlobalDataHandler.addGlobalData,
                //swagger related
                description: 'Add global data to prioritize Providers for filter algorithm',
                notes: 'Add global data to prioritize Providers for filter algorithm',
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        //payloadType: 'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    payload: {

                        eta   : Joi.object({eta_priority_ranges : Joi.array().items()}),
                        price : Joi.object({total_weight : Joi.number()}),
                        skill_level : Joi.object({skill_priority_ranges : Joi.array().items()}),
                        rating : Joi.object({total_weight : Joi.number()}),
                        job_acceptance : Joi.object({total_weight : Joi.number()}),
                        filter_radius : Joi.number().required()

                        /*eta_first_priority : Joi.object({
                            min: Joi.number(),
                            max: Joi.number()
                        }),
                        eta_second_priority : Joi.object({
                            min: Joi.number(),
                            max: Joi.number()
                        }),
                        eta_third_priority : Joi.object({
                            min: Joi.number(),
                            max: Joi.number()
                        }),
                        eta_fourth_priority : Joi.object({
                            min: Joi.number(),
                            max: Joi.number()
                        }),
                        eta_fifth_priority : Joi.object({
                            min: Joi.number(),
                            max: Joi.number()
                        }),
                        eta_sixth_priority : Joi.object({
                            min: Joi.number(),
                            max: Joi.number()
                        }),*/
                        /*skill_level_first_priority : Joi.object({
                            name: Joi.string(),

                        }),
                        skill_level_second_priority : Joi.object({
                            name: Joi.string(),

                        }),
                        skill_level_third_priority : Joi.object({
                            name: Joi.string(),

                        })*/
                    },
                    headers: {
                        //Authorization : Joi.string().description('access token is required.')
                    },
                    options: {abortEarly: false, allowUnknown: true,}
                }
            }
        },
        {
            method:'GET',
            path:"/admin/globaldata",
            config:{
                auth:false,
                handler:adminGlobalDataHandler.getGlobalData,
                description: 'Get Global data for admin By Location',
                notes: 'Get Global data for admin By Location',
                tags: ['api','admin'],
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

        },
        {
            method: 'PUT',
            path: '/admin/globaldata',
            config: {
                auth: false,
                handler: adminGlobalDataHandler.editGlobalData,
                //swagger related
                description: 'Edit global data to prioritize Providers for filter algorithm',
                notes: 'Edit global data to prioritize Providers for filter algorithm. Also we can make admin global parameters active/inactive.',
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        //payloadType: 'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    payload: {
                        doc_id : Joi.string(),
                        eta : Joi.object({eta_priority_ranges : Joi.array().items(),is_active : Joi.bool().required()}),
                        price : Joi.object({total_weight : Joi.number(),is_active : Joi.bool().required()}),
                        skill_level : Joi.object({skill_priority_ranges : Joi.array().items(),is_active : Joi.bool().required()}),
                        rating : Joi.object({total_weight : Joi.number(),is_active : Joi.bool().required()}),
                        job_acceptance : Joi.object({total_weight : Joi.number(),is_active : Joi.bool().required()}),
                        filter_radius : Joi.number().required()
                    },
                    headers: {
                        //Authorization : Joi.string().description('access token is required.')
                    },
                    options: {abortEarly: false, allowUnknown: true,}
                }
            }
        },

    ])

    next();
}


module.exports.register.attributes = {
    name: 'futrun--module',
    version: '0.0.1'
};