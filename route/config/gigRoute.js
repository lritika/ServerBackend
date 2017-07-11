/**
 * Created by cl-macmini-149 on 31/01/17.
 */
'use strict'

const Joi = require('joi');

//create logger
const log = require('Utils/logger.js');
const logger = log.getLogger();
var gigHandler= require( 'handler/config/gigHandler.js' );
const HttpErrors = require('Utils/httperrors.js');

module.exports={};
module.exports.register = function(server, options, next) {

    server.route([
        {

            method: 'PUT',
            path: '/admin/gigs',
            config: {
                auth: 'token2',
                handler:gigHandler.updateGigHandler,
                //swagger related
                description: 'Update Gig with GigID',
                notes: 'Update Gig with GigID',
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
                    payload :{
                        gig_id:                  Joi.string().required(),
                        gig_name                    : Joi.string().optional().allow(''),
                        alternate_gig_name:           Joi.string().optional().allow(''),
                        pricing                     : Joi.array().items(Joi.object({
                            type:Joi.string().optional().allow(''),
                            default_rate:Joi.string().optional().allow(''),
                            median:Joi.string().optional().allow('')
                        })).optional().allow(''),
                        revenue_model               : Joi.array().items(Joi.object({
                            type:Joi.string().optional().allow(''),
                            value:Joi.string().optional().allow(''),
                            revenue_model_for   : Joi.string().valid(['organization' , 'individual']).optional().allow('')
                        })).optional().allow(''),// monthly quaterly annuly percentgr base for every transction
                        gig_categories              : Joi.array().items(Joi.object({
                            _id:Joi.string(),
                            category_name    : Joi.string()
                        })).optional().allow(''),//telling whether it is a product based gig or not
                        skill_level                 :Joi.string().optional().allow('').description("Add with , when adding Multiple") ,                               //N/H/P
                        min_age                     : Joi.string().optional().allow(''),
                        gig_booking_options         :Joi.string().optional().allow('').description("Add with , when adding Multiple") ,                              // mongoose id of gig flow document collection
                        tool_required               : Joi.bool().required(),    // true - yes , false -No
                        additional_comments          : Joi.string().optional().allow(''),
                        addSupplies:                   Joi.bool().required(),
                        no_of_giggers                :Joi.string().optional(),
                        is_gigger_required           :Joi.bool().required(),
                        set_unit                    : Joi.string().optional().allow(''),
                        max_fixed_price:Joi.string().optional().allow(''),
                        max_hourly_price:Joi.string().optional().allow(''),
                        number_of_hours:Joi.string().optional().allow(''),
                        gig_image                   :  Joi.any().
                        meta({swaggerType: 'file'}).
                        optional().description('image file'),
                        booking_location:Joi.array().items(Joi.string())
                    },
                    headers: {
                        Authorization : Joi.string().description('access token is required.')
                    },
                    options: {abortEarly:false, allowUnknown:true,}
                },
            }
        },
        {

            method: 'POST',
            path: '/admin/gigs',
            config: {
                auth: 'token2',
                handler: gigHandler.createGigAdmin,
                //swagger related
                description: 'Create A new Gig With ServiceId',
                notes: 'Register Gig With Service ID so Register A service First',
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
                    payload :{
                        service_id:                  Joi.string().required(),
                        service_name:                 Joi.string().required(),
                        gig_name                    : Joi.string().required(),
                        alternate_gig_name          :Joi.string().optional().allow(''),
                        pricing                     : Joi.array().items(Joi.object({
                            type:Joi.string().required(),
                            default_rate:Joi.string().required(),
                            median:Joi.string().optional().allow('')
                        })),
                        revenue_model               : Joi.array().items(Joi.object({
                            type                : Joi.string().required(),
                            value               : Joi.string().required(),
                            revenue_model_for   : Joi.string().valid(['organization' , 'individual']).optional().allow('')
                        })),                     // monthly quaterly annuly percentgr base for every transction
                        gig_categories              : Joi.array().items(Joi.object({
                            category_name    : Joi.string()
                        })).optional().allow(''),//telling whether it is a product based gig or not
                        skill_level                 :Joi.string().required().description("Add with , when adding Multiple") ,                               //N/H/P
                        is_product_based   :         Joi.bool().required(),        // in this case flow will be 3. default flow will be 2
                        min_age                     : Joi.string().required(),
                        gig_booking_options         :Joi.string().required().description("Add with , when adding Multiple"),                               // mongoose id of gig flow document collection
                        tool_required               : Joi.bool().required(),    // true - yes , false -No
                        additional_comments          : Joi.string().optional().allow(''),
                        addSupplies:                   Joi.bool().required(),
                        no_of_giggers                :Joi.string().optional(),
                        is_gigger_required           :Joi.bool().required(),
                        set_unit                    : Joi.string().required(),
                        max_fixed_price:Joi.string().optional().allow(''),
                        max_hourly_price:Joi.string().optional().allow(''),
                        number_of_hours:Joi.string().optional().allow(''),
                        gig_image                   :  Joi.any().
                        meta({swaggerType: 'file'}).
                        required().description('image file'),
                        booking_location:Joi.array().items(Joi.string().optional().allow(''))
                    },
                    headers: {
                        Authorization : Joi.string().description('access token is required.')
                    },
                    options: {abortEarly:false, allowUnknown:true,}
                },
            }
        },
        {
            method:'GET',
            path:'/admin/gigs/categories',
            config:{
                auth:false,
                handler:gigHandler.getAllCategoriesByGigId,
                //swagger
                description:'Get All categories of product based Gigs',
                notes: 'Get All categories of product based Gigs. Gig id is passed in query param',
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        payloadType:'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    query: {
                        gig_id: Joi.string().required()
                    },
                    options: {
                        abortEarly:false, allowUnknown:true
                    }
                },
            }
        },
        {
            method:'POST',
            path:'/admin/gigs_location',
            config:{
                auth:false,
                handler:gigHandler.addMapperHandler,
                //swagger
                description:'Map Service With Location',
                notes: 'Map service with location ||Add more than one using a , in between two locationIDs',
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {


                        //payloadType:'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    payload:{
                        mapper:Joi.array().items(Joi.object({
                            gig_id:Joi.string().required(),
                            location_id:Joi.string().required(),
                            location_name:Joi.string().required()
                        })),
                        service_id:Joi.string().required(),
                        //gigID:Joi.string().required().description("add gig here"),
                        //locationID:Joi.string().required().description("Add more than one using a , in between two locationIDs")
                    },
                    options: {
                        abortEarly:false, allowUnknown:true
                    }
                },
            }
        },
        {
            method:'PUT',
            path:'/admin/gigs_location',
            config:{
                auth:false,
                handler:gigHandler.updateMapperHandler,
                //swagger
                description:'Map Service With Location',
                notes: 'Map service with location ||Add more than one using a , in between two locationIDs',
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        //payloadType:'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    payload:{
                        serviceID       :Joi.string().required(),
                        gigID           :Joi.string().required(),
                        locationID      :Joi.string().required(),
                        pricing         : Joi.array().items(Joi.object({
                               type:Joi.string().optional().allow(''),
                               default_rate:Joi.string().optional().allow(''),
                        })).optional().allow(''),
                        revenue_model   : Joi.array().items(Joi.object({
                                type:Joi.string().optional().allow(''),
                                value:Joi.string().optional().allow(''),
                                revenue_model_for   : Joi.string().valid(['organization' , 'individual']).optional().allow('')
                        })).optional().allow(''),




                        //update:Joi.array().items(Joi.object({
                        //    locationID:Joi.string().required(),
                        //    pricing                     : Joi.array().items(Joi.object({
                        //        type:Joi.string().optional().allow(''),
                        //        default_rate:Joi.string().optional().allow(''),
                        //    })).optional().allow(''),
                        //    revenue_model               : Joi.array().items(Joi.object({
                        //        type:Joi.string().optional().allow(''),
                        //        value:Joi.string().optional().allow(''),
                        //    })).optional().allow(''),
                        //})).optional().allow(''),

                    },
                    options: {
                        abortEarly:false, allowUnknown:true
                    }
                },
            }
        },
        {
            method:'GET',
            path:'/admin/gigs',
            config:{
                auth:false,
                handler:gigHandler.getAllGigsHandler,
                //swagger
                description:'Get All Gigs',
                notes: 'Get All Gigs',
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
            path:'/admin/gig_location',
            config:{
                auth:'token2',
                handler:gigHandler.getGigsMapping,
                //swagger
                description:'Map Service Get ',
                notes: 'GET Map service with location',
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        payloadType:'form',
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
                },
            }
        },
        {
            method:'GET',
            path:'/admin/service/gig_location',
            config:{
                auth:'token2',
                handler:gigHandler.getGigMappingByService,
                //swagger
                description:'Map Service Get ',
                notes: 'GET Map service with location',
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        payloadType:'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    query:{
                        service_id:Joi.string().required()
                    },
                    headers: {
                        Authorization : Joi.string().description('access token is required.')
                    },
                    options: {
                        abortEarly:false, allowUnknown:true
                    }
                },
            }
        },
        {
            method:'GET',
            path:'/provider/gig/locations',
            config:{
                auth:false,
                handler:gigHandler.getGigMapperHandler,
                //swagger
                description:'Map Service Get ',
                notes: 'Get Location for every Gig',
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        payloadType:'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    query:{
                      gigID:Joi.string().required()
                    },
                    //headers: {
                    //    Authorization : Joi.string().description('access token is required.')
                    //},
                    options: {
                        abortEarly:false, allowUnknown:true
                    }
                },
            }
        },
        {
            method: 'PUT',
            path: '/admin/gigs/gigspecificparam',
            config: {
                auth: 'token2',
                handler: gigHandler.addGigSpecificParam,
                //swagger related
                description: 'Update Gig with specific parameter realted to gig',
                notes: 'Update Gig with gig specific parameter',
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        //payloadType: 'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    payload: {
                        gig_id: Joi.string().required(),
                        gig_specific_param: Joi.object({
                            geofencing_enabled: Joi.bool().required(),
                            weather_api: Joi.bool().required(),
                            profile_cards: Joi.array().items(Joi.string()).required(),
                            //is_slider : Joi.bool().required(),
                            add_attributes: Joi.array().items(Joi.object({
                                key             : Joi.string().required(),
                                value           : Joi.alternatives().try(Joi.string(), Joi.object(),Joi.array()),
                                is_multi        : Joi.bool().required(),
                                is_slider       : Joi.bool().required(),
                                seeker_key      : Joi.string().required(),
                                seeker_is_multi : Joi.bool().required(),
                                seeker_is_slider: Joi.bool().required(),
                            })).optional().allow('')

                        })
                    },
                    headers: {
                        Authorization: Joi.string().description('access token is required.')
                    },
                    options: {abortEarly: false, allowUnknown: true,}
                }
            }
        },
        {
            method: 'GET',
            path: '/users/gigs/gigspecificparam',
            config: {
                auth: 'token1',
                handler: gigHandler.getGigSpecificParam,
                //swagger related
                description: 'Update Gig with specific parameter realted to gig',
                notes: 'Update Gig with gig specific parameter',
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        //payloadType: 'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    query: {
                        gig_id: Joi.string().required()
                    },
                    headers: {
                        Authorization: Joi.string().description('access token is required.')
                    },
                    options: {abortEarly: false, allowUnknown: true,}
                }
            }
        }

    ])

    next();
}


module.exports.register.attributes = {
    name: 'futrun-gig-module',
    version: '0.0.1'
};