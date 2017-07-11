/**
 * Created by clicklabs on 6/12/17.
 */

'use strict'
const Joi = require('joi');

//create logger
const log = require('Utils/logger.js');
const logger = log.getLogger();

const organizationTypeHandler = require( 'handler/config/organizationtypehandler' );
const HttpErrors = require('Utils/httperrors.js');

module.exports.register = function(server, options, next) {

    server.route([
        {
            method:'POST',
            path:"/organization/type",
            config:{
                auth:false,
                handler:organizationTypeHandler.setOrganizationTypes,
                description: 'Set all organization types with its flags',
                notes: 'Set all organization types with its flags',
                tags: ['api','org'],
                plugins: {
                    'hapi-swagger': {
                        //payloadType: 'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    payload:
                    {
                        docs:Joi.array().items(Joi.object({
                            organization_type   : Joi.string(),
                            org_tab_flag        : Joi.bool().required(),
                            bank_tab_flag       : Joi.bool().required(),
                            insurance_tab_flag  : Joi.bool().required(),
                            is_active           : Joi.bool().required()

                        }))
                    },
                    options: {abortEarly: false, allowUnknown: true,}
                }

            }

        },
        {
            method:'GET',
            path:"/organization/type",
            config:{
                auth:false,
                handler:organizationTypeHandler.getOrganizationTypes,
                description: 'Get Organization Types',
                notes: 'Get Organization Types',
                tags: ['api','org'],
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
    name: 'futrun-org-module',
    version: '0.0.1'
};