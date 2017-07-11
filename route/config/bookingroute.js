/**
 * Created by cl-macmini-63 on 2/24/17.
 */

'use strict'
const Joi = require('joi');

//create logger
const log = require('Utils/logger.js');
const logger = log.getLogger();

var bookingHandler= require( 'handler/config/bookinghandler.js' );

const HttpErrors = require('Utils/httperrors.js');


module.exports={};
module.exports.register = function(server, options, next) {

    server.route([
        {

            method: 'POST',
            path: '/booking/seekerselect',
            config: {
                auth: false,
                handler: bookingHandler.createBookingForSeekerSelect,
                //swagger related
                description: "create Booking for Seeker Select flow will work for Lowest Deal Also",
                notes: "Create new booking. SP is selected by seeker. Booking data present in payload",
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        //payloadType: 'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    payload: {
                        seeker_id                  : Joi.string().required(),
                        seeker_name                : Joi.string().required(),
                        seeker_device_token        : Joi.string().required(),
                        seeker_device_type         : Joi.string().required(),
                        provider_id                : Joi.string().required(),
                        ODS_type:                   Joi.string().required(),
                        booking_item_info          : Joi.object({
                            service_id      : Joi.string().required(),
                            gig_id          : Joi.string().required(),
                            booked_price_value:Joi.string().optional().allow(''),
                            booked_price_type:Joi.string().optional().allow(''),
                        }),
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
                        booking_longitude1:Joi.string().optional().allow(''),
                        booking_datetime:Joi.string().required(),
                        quantity:Joi.string().required(),
                        tools:Joi.bool().required(),
                        supplies:Joi.bool().default('false'),
                        description:Joi.string().optional().allow(''),
                        unit:Joi.string().required(),
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
            path: '/booking/confirm',
            config: {
                auth: false,
                handler: bookingHandler.bookingAcceptedBySP,
                //swagger related
                description: "Confirm Booking for Seeker Select flow SP Side Confirmation",
                notes: "Confirm new booking, booking is accepted by SP. API Created at : Mon Feb 27 2017 16:03:16",
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        //payloadType: 'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    payload: {
                        booking_id            : Joi.string().required(),
                        provider_id           : Joi.string().required(),
                        provider_name         : Joi.string().required(),
                        provider_device_token : Joi.string().required(),
                        provider_device_type  : Joi.string().required(),
                        is_seeker_location    : Joi.bool().required(),
                        //is_product_based:         Joi.bool().required(),
                        //gig_id:                 Joi.string().required()
                    },
                    headers: {
                        //Authorization : Joi.string().description('access token is required.')
                    },
                    options: {abortEarly: false, allowUnknown: true}
                },
            }
        },
        {
            method:'PUT',
            path:'/booking/productbasedgig/products',
            config:{
                auth: false,
                handler: bookingHandler.bookingConfirmedProduct,
                //swagger related
                description: "Adding Products to cart by Seeker and place order to SP",
                notes: "Adding Products to cart by Seeker and place order to SP for Every Flow ",
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        //payloadType: 'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    payload : {
                        booking_id : Joi.string().required(),
                        booking_datetime : Joi.string().optional().allow(''),
                        seeker_id:Joi.string().required(),
                        //booked_price_value:Joi.string().optional().allow(''),
                        //booked_price_type:Joi.string().optional().allow(''),
                        isProduct:Joi.bool().required(),
                        product:Joi.array().items(Joi.object(
                            {
                                product_id:Joi.string().optional().allow(''),
                                quantity:Joi.string().optional().allow('')
                            }
                        )).optional().allow(''),
                        net_amount:Joi.string().optional().allow('')
                    },
                    headers: {
                        //Authorization : Joi.string().description('access token is required.')
                    },
                    options: {abortEarly: false, allowUnknown: true}
                },
            }
        },
        //Product based gig provider confirmation
        {

            method: 'PUT',
            path: '/booking/productbasedgig/products/confirm',
            config: {
                auth: false,
                handler: bookingHandler.productBookingAcceptedBySP,
                //swagger related
                description: "Confirm Booking for Seeker Select flow SP Side Confirmation",
                notes: "Confirm new booking, booking is accepted by SP. API Created at : Mon Feb 27 2017 16:03:16",
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        //payloadType: 'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    payload: {
                        booking_id            : Joi.string().required(),
                        provider_id           : Joi.string().required(),
                        provider_name         : Joi.string().required(),
                        provider_device_token : Joi.string().required(),
                        provider_device_type  : Joi.string().required(),
                        is_seeker_location    : Joi.bool().required(),
                        is_product_based:         Joi.bool().required(),
                        gig_id:                 Joi.string().required()
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
            path: '/booking/confirm/provider',
            config: {
                auth: false,
                handler: bookingHandler.acceptedDataSP,
                //swagger related
                description: "Provider Data after confirm",
                notes: "Provider Data After Booking Accepted 20 Mar,2017 6:18",
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        payloadType: 'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    query: {
                        provider_id           : Joi.string().required(),
                    },
                    headers: {
                        //Authorization : Joi.string().description('access token is required.')
                    },
                    options: {abortEarly: false, allowUnknown: true}
                },
            }

        },
        { method: 'POST',
            path: '/booking/rejected',
            config: {
                auth: false,
                handler: bookingHandler.bookingRejectedByProvider,
                //swagger related
                description: "Confirm Booking for Seeker Select flow",
                notes: "Confirm new booking, booking is accepted by SP. API Created at : Mon Feb 27 2017 16:03:16",
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        //payloadType: 'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    payload: {
                        provider_id           : Joi.string().required(),
                        booking_id            : Joi.string().required(),
                        rejection_reason      : Joi.string().optional(),
                        
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
            path: '/booking/{booking_id}',
            config: {
                auth: false,
                handler: bookingHandler.getBookingDetails,
                //swagger related
                description: "Get Booking details by booking id",
                notes: " GEt Booking details for SP.API Created at : Mon March 20 2017 16:03:16",
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        //payloadType: 'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    params : {
                        booking_id : Joi.string().required().description(
                            'Booking_id is required.'),
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
            path: '/booking/start/{booking_id}',
            config: {
                auth: false,
                handler: bookingHandler.startBooking,
                //swagger related
                description: "Change booking status",
                notes: " Change booking status. Start Booking.API Created at : Mon March 20 2017 16:03:16",
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        //payloadType: 'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    params : {
                        booking_id : Joi.string().required().description(
                            'Booking_id is required.'),
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
            path: '/booking/on-the-way/{booking_id}',
            config: {
                auth: false,
                handler: bookingHandler.onTheWay,
                //swagger related
                description: "Change booking status",
                notes: " Change booking status. onTheWay Booking.API Created at : Mon March 21 2017 13:03:16",
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        //payloadType: 'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    params : {
                        booking_id : Joi.string().required().description(
                            'Booking_id is required.'),
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
            path: '/booking/pause/{booking_id}',
            config: {
                auth: false,
                handler: bookingHandler.pauseBooking,
                //swagger related
                description: "Change booking status",
                notes: " Change booking status. Pause Booking.API Created at : Mon March 21 2017 13:03:16",
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        //payloadType: 'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    params : {
                        booking_id : Joi.string().required().description(
                            'Booking_id is required.'),
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
            path: '/booking/resume/{booking_id}',
            config: {
                auth: false,
                handler: bookingHandler.resumeBooking,
                //swagger related
                description: "Change booking status",
                notes: " Change booking status. Resume Booking.API Created at : Mon March 21 2017 13:03:16",
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        //payloadType: 'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    params : {
                        booking_id : Joi.string().required().description(
                            'Booking_id is required.'),
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
            path: '/booking/end/{booking_id}',
            config: {
                auth: false,
                handler: bookingHandler.endBooking,
                //swagger related
                description: "Change booking status",
                notes: " Change booking status. End Booking.API Created at : Mon March 21 2017 13:03:16",
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        //payloadType: 'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    params : {
                        booking_id : Joi.string().required().description(
                            'Booking_id is required.'),
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
            path: '/booking/rateSP/{booking_id}',
            config: {
                auth: false,
                handler: bookingHandler.rateSPForBooking,
                //swagger related
                description: "Change booking status. Rate SP by Seeker",
                notes: " Change booking status. Rate SP for Booking by Seeker.API Created at : Mon March 23 2017 13:03:16",
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        //payloadType: 'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    params : {
                        booking_id : Joi.string().required().description(
                            'Booking_id is required.'),
                    },
                    payload : {
                        rating   : Joi.string().required(),
                        feedback : Joi.string()
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
            path: '/booking/rateseeker/{booking_id}',
            config: {
                auth: false,
                handler: bookingHandler.rateSeekerForBooking,
                //swagger related
                description: "Change booking status.Rate Seeker by SP",
                notes: " Change booking status. Rate Seeker for Booking by SP.API Created at : Mon March 23 2017 13:03:16",
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        //payloadType: 'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    params : {
                        booking_id : Joi.string().required().description(
                            'Booking_id is required.'),
                    },
                    payload : {
                        rating   : Joi.string().required(),
                        feedback : Joi.string()
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
            path: '/booking/seekers',
            config: {
                auth: false,
                handler: bookingHandler.getSeekerBookingsByPagination,
                //swagger related
                description: "Get All Booking of Seeker by seeker id",
                notes: "Get all Booking Data of a Seeker. Results will be displayed in pagination",
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
                            seeker_id:Joi.string(),
                            status : Joi.string().valid(['Unconfirmed' , 'Confirmed','Closed','Rejected'])
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
            method: 'PUT',
            path: '/gigs/bulkUpdate',
            config: {
                auth: false,
                handler: bookingHandler.bulkUpdate,
                //swagger related
                description: "Change booking status",
                notes: " Change booking status. Rate SP for Booking by Seeker.API Created at : Mon March 23 2017 13:03:16",
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        //payloadType: 'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    payload : {
                        booking_location:Joi.array().items(Joi.string())
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
            path: '/booking/productbasedgig',
            config: {
                auth: false,
                handler: bookingHandler.createBookingProducts,
                //swagger related
                description: "create Booking for Products in All flows when SP decides",
                notes: "Create new booking. SP is selected with flows and then booking Id generated",
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        //payloadType: 'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    payload: {
                        seeker_id                  : Joi.string().required(),
                        seeker_name                : Joi.string().required(),
                        seeker_device_token        : Joi.string().required(),
                        seeker_device_type         : Joi.string().required(),
                        provider_id                : Joi.string().required(),
                        ODS_type:                   Joi.string().required(),
                        booking_item_info          : Joi.object({
                            service_id      : Joi.string().required(),
                            gig_id          : Joi.string().required(),
                            booked_price_value:Joi.string().required(),
                            booked_price_type:Joi.string().required(),
                        }),
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
                        booking_longitude1:Joi.string().optional().allow(''),
                        booking_datetime:Joi.string().required(),
                        quantity:Joi.string().required(),
                        tools:Joi.bool().required(),
                        supplies:Joi.bool().default('false'),
                        description:Joi.string().optional().allow(''),
                        unit:Joi.string().required(),
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
            path: '/booking/schedular/{provider_id}',
            config: {
                auth: false,
                handler: bookingHandler.getBookingDetailsForMonth,
                //swagger related
                description: "Get Booking details by provider_id for specific month",
                notes: " GEt Booking details for SP by month .API Created at : TUE JUNE 13 2017 18:03:16",
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        //payloadType: 'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    params : {
                        provider_id : Joi.string().required().description(
                            'provider_id is required.'),
                    },
                    query : {
                        month : Joi.string().required(),
                        year  : Joi.string().required()
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
            path: '/booking/history/services',
            config: {
                auth: 'token1',
                handler: bookingHandler.getAllBookedServicesByUserId,
                //swagger related
                description: "Get all services history booked by user or provided by provider",
                notes: " Get all services history booked by user or provided by provider .API Created at : SUN JUNE 18 2017 14:03:16",
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        //payloadType: 'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    headers: {
                        Authorization : Joi.string().description('access token is required.')
                    },
                    options: {abortEarly: false, allowUnknown: true}
                },
            }
        },
        {
            method: 'GET',
            path: '/booking/history/{service_id}/gigs',
            config: {
                auth: 'token1',
                handler: bookingHandler.getAllBookedGigsForSpecificServiceByUserId,
                //swagger related
                description: "Get all gigs for particular services history booked by user or provided by provider",
                notes: " Get all gigs for particular services history booked by user or provided by provider .API Created at : SUN JUNE 18 2017 14:03:16",
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        //payloadType: 'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    params : {
                        service_id : Joi.string().required().description(
                            'service_id is required.'),
                    },
                    headers: {
                        Authorization : Joi.string().description('access token is required.')
                    },
                    options: {abortEarly: false, allowUnknown: true}
                },
            }
        },

        //Apis For Cron- Booking status Changes
        {
            method:'POST',
            path:'/booking/status/cron',
            config:{
                auth:false,
                handler:bookingHandler.bookingCronStatus,
                description:'This Api to change booking Status Checking Cron',
                notes:'This Api not to be tested and Applied For Node internal Processing',
                tags:['api'],
                plugins:{
                    'hapi-swagger': {
                        //payloadType: 'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate:{
                payload:{},
                    options: {abortEarly: false, allowUnknown: true}
                }
            }
        }
    ])

    next();
}


module.exports.register.attributes = {
    name: 'futrun-booking-module',
    version: '0.0.1'
};