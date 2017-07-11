/**
 * Created by cl-macmini-63 on 2/1/17.
 */
'use strict'
const Boom = require('boom');
const Joi = require('joi');

//create logger
const log = require('Utils/logger.js');
const logger = log.getLogger();

var cardHandler= require( 'handler/config/cardhandler.js' );

const HttpErrors = require('Utils/httperrors.js');

module.exports={};
module.exports.register = function(server, options, next) {

    server.route([
        {

            method: 'POST',
            path: '/cards',
            config: {
                auth: false,
                handler: cardHandler.addCards,
                //swagger related
                description: 'Add Cards',
                notes: 'Add cards',
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        payloadType: 'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                payload: {
                    maxBytes: 10000000,
                    parse: true,
                    output: 'file',
                    allow: 'multipart/form-data'
                },
                validate: {
                    payload: {
                        card_name: Joi.string(),
                        card_type : Joi.string(),
                        card_fields: Joi.array().items(Joi.object({
                            name: Joi.string(),
                            type: Joi.string()
                        })),
                        icon: Joi.any()
                            .meta({swaggerType: 'file'})
                            .required()
                            .description('image file'),
                    },
                    headers: {
                        //Authorization : Joi.string().description('access token is required.')
                    },
                    options: {abortEarly: false, allowUnknown: true,}
                },
            }
        }

    ])

    next();
}


module.exports.register.attributes = {
    name: 'futrun-cards-module',
    version: '0.0.1'
};