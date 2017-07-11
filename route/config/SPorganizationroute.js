/**
 * Created by cl-macmini-149 on 07/06/17.
 */

'use strict'
//const Boom = require('boom');
const Joi = require('joi');

//create logger
const log = require('Utils/logger.js');
const logger = log.getLogger();

var SPOrganizationHandler = require( 'handler/config/SPorganizationhandler.js' );

const HttpErrors = require('Utils/httperrors.js');

module.exports={};
module.exports.register = function(server, options, next) {

    server.route([
        {
            method: 'POST',
            path: '/sporganization',
            config: {
                auth: 'token1',
                handler: SPOrganizationHandler.addOrganizationData,
                //swagger related
                description: 'Add Organization Details , and set org_tab_flag to true',
                notes: 'Add Organization Details , and set org_tab_flag to true. Bank Details and Insurance details will be added in PUT api',
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        payloadType: 'form',
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
                    payload: {
                        org_details : Joi.object({
                            organization_type  : Joi.string(),
                            organization_name  : Joi.string(),
                            organization_email : Joi.string(),
                            organization_phone : Joi.string(),
                            country_code       : Joi.string(),
                            ssn                : Joi.string(),
                            federal_id         : Joi.string(),
                        }),
                        certificate : Joi.any().meta({swaggerType: 'file'}).required().description('Image of certificate'),
                        licence : Joi.any().meta({swaggerType: 'file'}).required().description('Image of licence'),
                    },
                    headers: {
                        Authorization : Joi.string().description('access token is required.')
                    },
                    options: {abortEarly: false, allowUnknown: true}
                }
            }
        },
        {
            method: 'PUT',
            path: '/sporganization/bankdetails',
            config: {
                auth: 'token1',
                handler: SPOrganizationHandler.addBankDetails,
                //swagger related
                description: "Add Bank Details for organization , and set bank_tab_flag to true",
                notes: "Add Bank Details for organization , and set bank_tab_flag to true",
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        //payloadType: 'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    payload:
                    {
                        organization_profile_id : Joi.string().required(),
                        bank_details : Joi.object({
                            bank_name  : Joi.string(),
                            account_type  : Joi.string(),
                            account_number : Joi.string(),
                            routing_number : Joi.string(),
                            bank_address   : {
                                Address1 :Joi.string().optional().allow(''),
                                Address2 :Joi.string().optional().allow(''),
                                City:Joi.string().required(),
                                State:Joi.string().required(),
                                ZipCode:Joi.string().required(),
                                Country:Joi.string().required()
                            },
                        })
                    },
                    headers: {
                        Authorization : Joi.string().description('access token is required.')
                    },
                    options: {abortEarly: false, allowUnknown: true}
                }
            }
        },
        {
            method: 'PUT',
            path: '/sporganization/insurancedetails',
            config: {
                auth: 'token1',
                handler: SPOrganizationHandler.addInsuranceDetails,
                //swagger related
                description: 'Add insurance Details , and set insurance_tab_flag to true',
                notes: 'Add insurance Details , and set insurance_tab_flag to true. Bank Details and Insurance details will be added in PUT api',
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        payloadType: 'form',
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
                    payload: {
                        organization_profile_id : Joi.string().required(),
                        insurance_details : Joi.object({
                            company_name  : Joi.string(),
                            policy_type  : Joi.string(),
                            insurance_number : Joi.string()
                        }),
                        insurance_doc : Joi.any().meta({swaggerType: 'file'}).required().description('Image of insurance_doc'),
                    },
                    headers: {
                        Authorization : Joi.string().description('access token is required.')
                    },
                    options: {abortEarly: false, allowUnknown: true}
                }
            }
        }
    ])

    next();
}


module.exports.register.attributes = {
    name: 'futrun--org-module',
    version: '0.0.1'
};