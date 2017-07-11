/**
 * Created by cl-macmini-149 on 06/02/17.
 */
/**
 * Created by cl-macmini-149 on 31/01/17.
 */
'use strict'
const Boom = require('boom');
const Joi = require('joi');

//create logger
const log = require('Utils/logger.js');
const logger = log.getLogger();

const locationHandler = require( 'handler/config/locationhandler.js' );
const HttpErrors = require('Utils/httperrors.js');

module.exports.register = function(server, options, next) {

    server.route([
        {
            method:'GET',
            path:"/location/gigs",
            config:{
                auth:false,
                handler:locationHandler.getGigsLocation,
                description: 'Get Gigs By Location and serviceID',
                notes: 'Add Lat Long And Current Gig to be Shown in Location',
                tags: ['api','location'],
                plugins: {
                    'hapi-swagger': {
                        payloadType: 'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    query: {
                        serviceID:Joi.string().required(),
                      latitude:Joi.string().required(),
                        longitude:Joi.string().required()
                    },
                    options: {abortEarly: false, allowUnknown: true,}
                }

            }

        },
        {
            method:'GET',
            path:"/location/services",
            config:{
                auth:false,
                handler:locationHandler.getServiceLocation,
                description: 'Get Gigs By Location',
                notes: 'Add Lat Long And Current Gig to be Shown in Location',
                tags: ['api','location'],
                plugins: {
                    'hapi-swagger': {
                        payloadType: 'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    query: {
                        latitude:Joi.string().required(),
                        longitude:Joi.string().required()
                    },
                    options: {abortEarly: false, allowUnknown: true,}
                }

            }

        }
    ])

    next();
}


module.exports.register.attributes = {
    name: 'futrun-location-module',
    version: '0.0.1'
};