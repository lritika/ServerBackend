/**
 * Created by cl-macmini-63 on 2/6/17.
 */

'use strict'
const Joi = require('joi');

//create logger
const log = require('Utils/logger.js');
const logger = log.getLogger();

var SPProfileHandler= require( 'handler/config/SPprofilehandler.js' );

const HttpErrors = require('Utils/httperrors.js');
const spTimeSchema=require('schema/mongo/SPtimeslots')

module.exports={};
module.exports.register = function(server, options, next) {

    server.route([
        {

            method: 'POST',
            path: '/provider/profile',
            config: {
                auth: false,
                handler: SPProfileHandler.createSPProfile,
                //swagger related
                description: "create Service Provider's profile",
                notes: "create Service Provider's profile",
                tags: ['api'],
                payload:{
                    maxBytes: 5000000,
                    parse: true,
                    output: 'file',
                    allow: 'multipart/form-data'
                },
                plugins: {
                    'hapi-swagger': {
                        payloadType: 'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    payload: {
                        first_name                  : Joi.string().required(),
                        last_name                   : Joi.string().required(),
                        provider_id                 : Joi.string().required(),
                        provider_email              : Joi.string().required(),
                        gender                      : Joi.string().required(),
                        ssn                         : Joi.string(),
                        revenue_type                : Joi.string(),
                        address			: {
                            Address1 :Joi.string().optional().allow(''),
                            Address2 :Joi.string().optional().allow(''),
                            City:Joi.string().required(),
                            State:Joi.string().required(),
                            ZipCode:Joi.string().required(),
                            Country:Joi.string().required()
                        },
                        certificate                 : Joi.any().meta({swaggerType: 'file'}).required().description('certificate image'),
                        licence                     : Joi.any().meta({swaggerType: 'file'}).required().description('licence image'),
                        is_volunteer:                Joi.bool().required()
                    },
                    headers: {
                        //Authorization : Joi.string().description('access token is required.')
                    },
                    options: {abortEarly: false, allowUnknown: true}
                },
            }
        },
        {

            method: 'GET',
            path: '/provider/socket',
            config: {
                auth: false,
                handler: SPProfileHandler.getAllProvidersByGigId,
                //swagger related
                description: "Get All Service Providers by gig id",
                notes: "Get List of All SP based on location , service id and gig id passed in query parameter",
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        payloadType: 'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    },
                    /*'hapiAuthorization': {
                        roles: ['SEEKER','PROVIDER']
                    }*/
                },
                validate: {
                    query: {
                        service_id : Joi.string().required(),
                        gig_id     : Joi.string().required(),
                        latitude   : Joi.number().required(),
                        longitude  : Joi.number().required()
                        
                    },
                    headers: {
                        //Authorization : Joi.string().description('access token is required.')
                    },
                    options: {abortEarly: false, allowUnknown: true}
                },
            }
        },
        {
            method: 'POST',
            path: '/provider/filter',
            config: {
                auth: 'token1',
                handler: SPProfileHandler.filterProviders,
                //swagger related
                description: "Get list of all Service Providers by filters",
                notes: "Returns List of All SP based on query string filters passed in query parameter",
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        //payloadType: 'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    },
                    'hapiAuthorization': {
                        roles: ['SEEKER','PROVIDER']
                    }
                },
                validate: {
                    payload: {
                        seeker_id:Joi.string().required(),
                        seeker_name:Joi.string().required(),
                        seeker_device_token:Joi.string().required(),
                        seeker_device_type:Joi.string().required(),
                        service_id : Joi.string().required(),
                        gig_id     : Joi.string().required(),
                        location   : Joi.object({
                            latitude  : Joi.number(),
                            longitude : Joi.number()
                        }).required(),
                        attributes : Joi.array().items(Joi.object({
                            key     : Joi.string().required(),
                            value   : Joi.array().items(Joi.string()).required(),
                            type    : Joi.string().required()
                        })),
                        eta         : Joi.object({
                            min_val     : Joi.string().required(),
                            max_val     : Joi.string().required()
                        }).required(),
                        tools       : Joi.bool().required(),
                        supplies    : Joi.bool().default('false'),
                        //supplies pending from front end
                        SP_level    : Joi.array().items(Joi.string()).required(),
                        //here booking_type ODS,RFP,SCH
                        booking_type:Joi.string().valid(["ODS","RFP","SCH"]).required(),
                        ODS_type    : Joi.string().valid(["System Select","Seeker Select","Lowest Deal","Reverse Bid"]).required(),
                        bid_amount  : Joi.string().optional().allow(''),
                        is_seeker_location:Joi.bool().required(),
                        booking_address:Joi.object({
                                Address1 :Joi.string().optional().allow(''),
                                Address2 :Joi.string().optional().allow(''),
                                City:Joi.string().optional().allow(''),
                                State:Joi.string().optional().allow(''),
                                ZipCode:Joi.string().optional().allow(''),
                                Country:Joi.string().optional().allow(''),
                        }).optional().allow(''),
                        booking_latitude:Joi.string().optional().allow(''),
                        booking_longitude:Joi.string().optional().allow(''),
                        booking_address1:Joi.object({
                            Address1 :Joi.string().optional().allow(''),
                            Address2 :Joi.string().optional().allow(''),
                            City:Joi.string().optional().allow(''),
                            State:Joi.string().optional().allow(''),
                            ZipCode:Joi.string().optional().allow(''),
                            Country:Joi.string().optional().allow(''),
                        }).optional().allow(''),
                        virtual_address:Joi.string().optional().allow(''),
                        booking_latitude1:Joi.string().optional().allow(''),
                        //is_product_based:Joi.bool().required(),
                        booking_longitude1:Joi.string().optional().allow(''),
                        quantity    : Joi.string().required(),
                        unit:Joi.string().required(),
                        description:Joi.string().optional().allow(''),
                        time_offset:Joi.number().optional().allow(''),
                        sch_booking_date    : Joi.string(),       // this is required only when booking_type is SCH
                        sch_booking_slot    : Joi.string()

                    },
                    headers: {
                        Authorization : Joi.string().description('access token is required.')
                    },
                    options: {abortEarly: false, allowUnknown: true}
                },
            }
        },
        {

            method: 'PUT',
            path: '/provider/servicesandgigs',
            config: {
                auth: false,
                handler: SPProfileHandler.AddServicesAndGigs,
                //swagger related
                description: "Add / UPDATE services and gigs to Provider's profile",
                notes: "cAdd or update services and gigs to Provider's profile",
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        //payloadType: 'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    payload: {
                        provider_id                 : Joi.string().required(),
                        //booking_type:Joi.array().items(Joi.string().required()),
                        service_and_gigs_info       : Joi.object({
                             service_id      : Joi.string(),
                             service_name    : Joi.string(),
                             gigs            : Joi.object({
                                 gig_id    : Joi.string(),
                                 gig_name  : Joi.string(),
                                 tools     : Joi.bool(),
                                 supplies  : Joi.bool(),
                                 level     : Joi.string().description('Send each value with , in between'),
                                 gig_specific_param :Joi.object({}),
                                 booking_type:Joi.array().items(Joi.string().required()),
                                }
                             )
                         })
                    },
                    headers: {
                        //Authorization : Joi.string().description('access token is required.')
                    },
                    options: {abortEarly: false, allowUnknown: true}
                },
            }
        },
        {
            method: 'PUT',
            path: '/provider/gig/locations',
            config: {
                auth: false,
                handler: SPProfileHandler.addLocationsAndPricingToGig,
                //swagger related
                description: "Add delivery locations and pricing revenues to a gig for SP Gig Location Mapping",
                notes: "Add delivery locations and pricing revenues to a gig for SP Gig Location Mapping",
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
                            docs:Joi.array().items(Joi.object({
                        profile_id: Joi.string(),
                        provider_id: Joi.string(),
                        gig_id: Joi.string(),
                        min_hourly_amount:Joi.string(),
                        discount         :Joi.string(),
                        location: Joi.object({
                            locationID:Joi.string().required(),
                            locationName:Joi.string().required()
                        }),
                        revenue: Joi.object({
                            model: Joi.string(),
                            value: Joi.string(),
                            revenue_model_for : Joi.string().valid(['organization' , 'individual']).required()
                        }),
                        pricing: Joi.array().items(Joi.object({
                            type    : Joi.string().required().valid(['fixed','hourly']),
                            value   : Joi.string().required()
                        }))
                     }))
                        },
                    headers: {
                        //Authorization : Joi.string().description('access token is required.')
                    },
                    options: {abortEarly: false, allowUnknown: true}
                },
            }
        },
        {

            method: 'POST',
            path: '/provider/timeslots',
            handler: SPProfileHandler.addSPTimeSlots,
            config: {
                auth: 'token1',
                //swagger related
                description: "Adding Time Slots by SP per Day",
                notes: "Add time slots in slots array and breaks in breaks array",
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        //payloadType: 'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    payload: spTimeSchema.joiPostSchema,
                    headers: {
                        Authorization : Joi.string().description('access token is required.')
                    },
                    options: {abortEarly: false, allowUnknown: true}
                },
            }
        },
        {
            method:'GET',
            path:'/provider/gigs/categories',
            config:{
                auth:false,
                handler:SPProfileHandler.CategoriesByGigId,
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
        //{
        //    method:'GET',
        //    path:'/provider/timeslots',
        //    handler:SPProfileHandler.getSPTimeSlots,
        //    config: {
        //        auth: 'token1',
        //        //swagger related
        //        description: "Adding Time Slots by SP per Day",
        //        notes: "Add time slots in slots array and breaks in breaks array",
        //        tags: ['api'],
        //        plugins: {
        //            'hapi-swagger': {
        //                //payloadType: 'form',
        //                responseMessages: HttpErrors.standardHTTPErrors
        //            }
        //        },
        //        validate: {
        //            query:{
        //                provider_id:Joi.string().required()},
        //            headers: {
        //                Authorization : Joi.string().description('access token is required.')
        //            },
        //            options: {abortEarly: false, allowUnknown: true}
        //        },
        //    }
        //}


        {
            method:'POST',
            path: '/provider/test/push',
            handler: SPProfileHandler.pushTestHandler,
            config: {
                auth: false,
                //swagger related
                description: "Sending Push via Device Token and type"+" "+new Date(),
                notes: "Sending Push via Device Token and type",
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        //payloadType: 'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    payload: {
                        provider_id:Joi.string().required(),
                        seeker_id:Joi.string().required(),
                      device_token:Joi.string().required(),
                        device_type:Joi.string().valid("ANDROID","IOS").required(),
                        booking_type:Joi.string().required()
                    },
                    //headers: {
                    //    Authorization : Joi.string().description('access token is required.')
                    //},
                    options: {abortEarly: false, allowUnknown: true}
                },
            }
        },
        {

            method: 'GET',
            path: '/provider',
            config: {
                auth: false,
                handler: SPProfileHandler.getProvider,
                //swagger related
                description: "Get All Details of Service Providers by Provider id",
                notes: "Get all Data of a provider",
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        payloadType: 'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                    //'hapiAuthorization': {
                    //    roles: ['SEEKER','PROVIDER']
                    //}
                },
                validate: {
                    query: {
                       provider_id:Joi.string().required()
                    },
                    //headers: {
                    //    Authorization : Joi.string().description('access token is required.')
                    //},
                    options: {abortEarly: false, allowUnknown: true}
                },
            }
        },
        {

            method: 'GET',
            path: '/provider/gigs/search',
            config: {
                auth: false,
                handler: SPProfileHandler.getSearch,
                //swagger related
                description: "Get All Service by gig_name",
                notes: "Get all Data of a provider",
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        payloadType: 'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                    //'hapiAuthorization': {
                    //    roles: ['SEEKER','PROVIDER']
                    //}
                },
                validate: {
                   query: {
                       search:Joi.string().required()
                    },
                    //headers: {
                    //    Authorization : Joi.string().description('access token is required.')
                    //},
                    options: {abortEarly: false, allowUnknown: true}
                },
            }
        },
        {

            method: 'GET',
            path: '/provider/{provider_id}/service/{service_id}/gig/{gig_id}',
            config: {
                auth: false,
                handler: SPProfileHandler.getGigInfoForProvider,
                //swagger related
                description: "Get All info for gig registered by provider.",
                notes: "Get All data for gig registered by provider.Gig id and Provider id passed as parameter",
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                    //'hapiAuthorization': {
                    //    roles: ['SEEKER','PROVIDER']
                    //}
                },
                validate: {
                    params : {
                        provider_id : Joi.string().required().description(
                            'Provider_id is required.'),
                        gig_id : Joi.string().required().description(
                            'Gig_id is required.'),
                        service_id : Joi.string().required().description(
                            'Service_id is required.'),
                    },
                    //headers: {
                    //    Authorization : Joi.string().description('access token is required.')
                    //},
                    options: {abortEarly: false, allowUnknown: true}
                },
            }
        },
        {

            method: 'GET',
            path: '/booking/providers',
            config: {
                auth: false,
                handler: SPProfileHandler.getProviderBookingsByPagination,
                //swagger related
                description: "Get All Booking of Service Providers by Provider id",
                notes: "Get all Booking Data of a provider. Results will be displayed in pagination",
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        //payloadType: 'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }/*,
                    'hapiAuthorization': {
                        roles: ['PROVIDER']
                    }*/
                },
                validate: {
                    query: {
                        filter :{
                            provider_id:Joi.string(),
                            status : Joi.string().valid(['Unconfirmed' , 'Confirmed','Closed', 'Rejected'])
                        },
                        pageno         : Joi.string().optional().allow(''),
                        resultsperpage : Joi.string().optional().allow('')
                    },
                    //headers: {
                    //    Authorization : Joi.string().description('access token is required.')
                    //},
                    options: {abortEarly: false, allowUnknown: true}
                },
            }
        },
        {
            method: 'GET',
            path: '/provider/{provider_id}/product_gigs',
            config: {
                auth: false,
                handler: SPProfileHandler.getProductBasedGigsForProvider,
                //swagger related
                description: "Get All product based gigs registered by provider.",
                notes: "Get All data for product based gig registered by provider.Gig id and Provider id passed as parameter",
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                    //'hapiAuthorization': {
                    //    roles: ['SEEKER','PROVIDER']
                    //}
                },
                validate: {
                    params : {
                        provider_id : Joi.string().required().description(
                            'Provider_id is required.'),
                        /*service_id is not necessary here
                        service_id : Joi.string().required().description(
                            'Service_id is required.'),*/
                    },
                    //headers: {
                    //    Authorization : Joi.string().description('access token is required.')
                    //},
                    options: {abortEarly: false, allowUnknown: true}
                },
            }
        },
        {

            method: 'POST',
            path: '/provider/productbasedgig',
            config: {
                auth: false,
                handler: SPProfileHandler.addProductInfoForGig,
                //swagger related
                description: "Add product info for gig under a specific product category",
                notes: "Add product info for gig under a specific product category",
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
                    payload:
                    {
                        profile_id: Joi.string(),
                        provider_id: Joi.string(),
                        gig_id: Joi.string(),
                        category_id : Joi.string(),
                        product_info        : Joi.object({
                            product_name    : Joi.string(),
                            product_desc    : Joi.string(),
                            price           : Joi.string(),
                            stock           : Joi.number(),
                            delivery_charge : Joi.string(),
                            unit:Joi.string()
                        }),
                        product_image:Joi.any().
                        meta({swaggerType: 'file'}).
                        required().description('Image of Product'),
                    },
                    headers: {
                        //Authorization : Joi.string().description('access token is required.')
                    },
                    options: {abortEarly: false, allowUnknown: true}
                },
            }
        },
        {
            method: 'GET',
            path: '/users/gig/category/products',
            config: {
                auth: false,
                handler:SPProfileHandler.getProductInfoForGig,
                //swagger related
                description: "products and categories according to gig id provider_id data returned to seeker",
                notes:"Api in SProute contact developer",
                tags: ['api','provider'],
                plugins: {
                    'hapi-swagger': {
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                    //'hapiAuthorization': {
                    //    roles: ['SEEKER','PROVIDER']
                    //}
                },
                validate: {
                    query : {
                        gig_id:Joi.string().required(),
                        provider_id:Joi.string().required()
                        /*service_id is not necessary here
                         service_id : Joi.string().required().description(
                         'Service_id is required.'),*/
                    },
                    //headers: {
                    //    Authorization : Joi.string().description('access token is required.')
                    //},
                    options: {abortEarly: false, allowUnknown: true}
                },
            }
        },
        {
            method: 'GET',
            path: '/provider/{provider_id}/service/{service_id}/gigs',
            config: {
                auth: false,
                handler: SPProfileHandler.getAllUnregisteredGigsByServiceId,
                //swagger related
                description: 'Get all unregistered gigs under a specific service for the provider.',
                notes: 'Returns data of allGigs which are not registered by Provider for a particular service. Service Id and Provider Id are present as params',
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        payloadType:'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    params : {
                        provider_id : Joi.string().required().description(
                            'Provider_id is required.'),
                        service_id : Joi.string().required().description(
                            'Service_id is required.')
                    },
                    //headers: {
                    //    Authorization : Joi.string().description('access token is required.')
                    //},
                    options: {abortEarly: false, allowUnknown: true}
                }
            }
        },
        {
            method: 'PUT',
            path: '/provider/gig/locations/pricing-revenues',
            config: {
                auth: false,
                handler: SPProfileHandler.updateLocationsAndPricingToGig,
                //swagger related
                description: "Update previous delivery locations and pricing revenues to a gig for SP Gig Location Mapping",
                notes: "Remove all previously added pricing location mapping and replace them with new payload",
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
                            docs:Joi.array().items(Joi.object({
                                profile_id: Joi.string(),
                                provider_id: Joi.string(),
                                gig_id: Joi.string(),
                                min_hourly_amount:Joi.string(),
                                discount         :Joi.string(),
                                location: Joi.object({
                                    locationID:Joi.string().required(),
                                    locationName:Joi.string().required()
                                }),
                                revenue: Joi.object({
                                    model: Joi.string(),
                                    value: Joi.string(),
                                    revenue_model_for : Joi.string().valid(['organization' , 'individual']).required()
                                }),
                                pricing: Joi.array().items(Joi.object({
                                    type    : Joi.string().required().valid(['fixed','hourly']),
                                    value   : Joi.string().required()
                                }))
                            }))
                        },
                    headers: {
                        //Authorization : Joi.string().description('access token is required.')
                    },
                    options: {abortEarly: false, allowUnknown: true}
                },
            }
        },
        {
            method: 'PUT',
            path: '/provider/gig/slots',
            handler: SPProfileHandler.updateSPTimeSlots,
            config: {
                //auth: 'token1',
                //swagger related
                description: "update Time Slots by SP per Day",
                notes: "update time slots in slots array",
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        //payloadType: 'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    payload: spTimeSchema.joiPostSchema,
                    headers: {
                        //Authorization : Joi.string().description('access token is required.')
                    },
                    options: {abortEarly: false, allowUnknown: true}
                },
            }
        },
        {
            method: 'PUT',
            path: '/provider/availability',
            handler: SPProfileHandler.updateSPAvailability,
            config: {
                auth: 'token1',
                //swagger related
                description: "Activate or deactivate SP availability flag in his Profile",
                notes: "Activate or deactivate SP availability flag in his Profile. is_available param is present in body payload",
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        //payloadType: 'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    payload: {provider_id : Joi.string(),is_available :Joi.bool().required()},
                    headers: {
                        Authorization : Joi.string().description('access token is required.')
                    },
                    options: {abortEarly: false, allowUnknown: true}
                },
            }
        },
        {
            method: 'PUT',
            path: '/provider/discountstatus',
            handler: SPProfileHandler.toggleDiscountFlagForSP,
            config: {
                auth: 'token1',
                //swagger related
                description: "Activate or deactivate SP discount flag in his Profile",
                notes: "Activate or deactivate SP dicount flag in his Profile. discount param is present in body payload",
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        //payloadType: 'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    payload: {provider_id : Joi.string(),discount :Joi.bool().required()},
                    headers: {
                        Authorization : Joi.string().description('access token is required.')
                    },
                    options: {abortEarly: false, allowUnknown: true}
                },
            }
        },
        {
            method: 'PUT',
            path: '/provider/dummy/payment',
            handler: SPProfileHandler.updateSPRevenuePaymentStatusDummy,
            config: {
                auth: 'token1',
                //swagger related
                description: "Update SP is revenue paid dummy api",
                notes: "Activate or deactivate SP availability flag in his Profile. is_available param is present in body payload",
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        //payloadType: 'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    payload: {provider_id : Joi.string(),is_revenue_paid :Joi.bool().required()},
                    headers: {
                        Authorization : Joi.string().description('access token is required.')
                    },
                    options: {abortEarly: false, allowUnknown: true}
                },
            }
        },
        {
            method: 'POST',
            path: '/provider/organization',
            config: {
                auth: 'token1',
                handler: SPProfileHandler.addOrganizationData,
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
                            profile_type       : Joi.string().valid('organization'),              // organization
                            organization_type  : Joi.string(),
                            organization_name  : Joi.string(),
                            organization_email : Joi.string(),
                            organization_phone : Joi.string(),
                            org_country_code   : Joi.string(),
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
            path: '/provider/organization/bankdetails',
            config: {
                auth: 'token1',
                handler: SPProfileHandler.addBankDetails,
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
            path: '/provider/organization/insurancedetails',
            config: {
                auth: 'token1',
                handler: SPProfileHandler.addInsuranceDetails,
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
        },
        {

            method: 'GET',
            path: '/provider/reviews',
            config: {
                auth: 'token1',
                handler: SPProfileHandler.getAllApprovedReviews,
                //swagger related
                description: "Get All reviews which are approved by ADMIN for SP",
                notes: "Get All reviews which are approved by ADMIN for SP",
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        payloadType: 'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                    //'hapiAuthorization': {
                    //    roles: ['SEEKER','PROVIDER']
                    //}
                },
                validate: {
                    query: {
                        provider_id : Joi.string().required()
                    },
                    //headers: {
                    //    Authorization : Joi.string().description('access token is required.')
                    //},
                    options: {abortEarly: false, allowUnknown: true}
                },
            }
        },
    ])

    next();
}


module.exports.register.attributes = {
    name: 'futrun-SP-module',
    version: '0.0.1'
};