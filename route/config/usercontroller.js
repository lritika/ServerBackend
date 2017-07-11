/**
 * Created by cl-macmini-63 on 1/16/17.
 */
'use strict';
var userHandler = require( 'handler/config/userhandler.js' );
const cardHandler= require( 'handler/config/cardhandler.js' );
let userSchema = require('schema/mongo/userschema');
var config=require('config');
const HttpErrors = require('Utils/httperrors.js');
const commonFunction=require('Utils/commonfunction.js')

var Joi = require('joi');
var swaggerDefaultResponseMessages = [
    {code: 200, message: 'OK'},
    {code: 400, message: 'Bad Request'},
    {code: 401, message: 'Unauthorized'},
    {code: 404, message: 'Data Not Found'},
    {code: 500, message: 'Internal Server Error'}
];

module.exports={};


module.exports.register = function(server, options, next) {

    server.route([
        {
            method: 'GET',
            path: '/users/{user_id}',			
            config: {							
                auth: 'token1',
                handler: userHandler.getUser,
                //swagger related
                description: 'Get User',
                notes: 'Returns User identified by the email id passed in parameter',
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        responseMessages:swaggerDefaultResponseMessages
                    },
                    'hapiAuthorization': {
                        roles: ['SEEKER','PROVIDER']
                    }
                },
                validate: {
                    params : {
                        user_id : Joi.string().required().description(
                            'User_id is required.')
                    },
                    headers: {
                        Authorization : Joi.string().description('access token is required.')
                    },
                    options: {
                        abortEarly:false, allowUnknown:true
                    }
                }
            }
        },
        //{
        //    method: 'POST',
        //    path: '/users',
        //    handler: userHandler.createNewUser,
        //    config:{
        //        auth: false,
        //        //swagger related
        //        description: 'Create User',
        //        notes: 'Create a new user',
        //        tags: ['api'],
        //        plugins: {
        //            'hapi-swagger': {
        //                payloadType: 'form',
        //                responseMessages: swaggerDefaultResponseMessages
        //            }
        //        },
        //        validate: {
        //            payload: userSchema.UserJoiPostSchema,
        //            headers: Joi.object().unknown(),
        //            options: {
        //                abortEarly:false, allowUnknown:true
        //            }
        //        },
        //    }
        //},
       //Created By Chandan
        {
            method:'POST',
            path:'/users/userSignUp',
            handler:userHandler.createUserHandler,
            config:{
                description:'Create User with Role || Chandan',
                tags:['api','user'],
                auth: false,
                payload: {
                    maxBytes: 5000000,
                    parse: true,
                    output: 'file',
                    allow: 'multipart/form-data'
                },
                validate:{
                    payload:{
                    first_name: Joi.string().max(20).required(),
                    last_name: Joi.string().max(20).required(),
                    fb_id:Joi.string().optional().allow(''),
                        address			: {
                            Address1 :Joi.string().optional().allow(''),
                            Address2 :Joi.string().optional().allow(''),
                            City:Joi.string().required(),
                            State:Joi.string().required(),
                            ZipCode:Joi.string().required(),
                            Country:Joi.string().required()
                        },
                        locationLatitude:Joi.string().required(),
                        locationLongitude:Joi.string().required(),
                    mobile: Joi.string().required(), 
                        countryCode:Joi.string().required(),
                    reg_as: Joi.string().valid('SEEKER' , 'PROVIDER').required(),
                    email: Joi.string().optional().allow(''),
                    password: Joi.string().optional().allow(''),      //.required(),
                    promo_code  : Joi.string(),           // optional It would be id of records from promocode collection
                    dob : Joi.string(),
                    app_version : Joi.string().required(),
                    device_token: Joi.string().required(),
                    device_type : Joi.string().valid('IOS','ANDROID').required(),           // IOS or ANDROID
                    time_zone   : Joi.number(),
                    seeker_profile_type : Joi.string().valid('individual','organization'),         // Required only in case of Seeker signup
                    profilePhoto: Joi.any()
                        .meta({swaggerType: 'file'})
                        //.required()
                        .description('image file'),
                },
                    failAction:commonFunction.failActionFunction
                },

                plugins:{
                    'hapi-swagger':{
                        payloadType:'form',
                        responseMessages:swaggerDefaultResponseMessages
                    }
                }
            }
        },
        {
            method:'PUT',
            path:'/users/userproflile',
            handler:userHandler.updateUserHandler,
            config:{
                description:'update user profile',
                tags:['api','user'],
                auth: false,
                payload: {
                    maxBytes: 5000000,
                    parse: true,
                    output: 'file',
                    allow: 'multipart/form-data'
                },
                validate:{
                    payload:{
                    user_id:Joi.string().required(),
                    first_name: Joi.string().max(20).required(),
                    last_name: Joi.string().max(20).required(),
                        address         : {
                            Address1 :Joi.string().optional().allow(''),
                            Address2 :Joi.string().optional().allow(''),
                            City:Joi.string().optional().allow(''),
                            State:Joi.string().optional().allow(''),
                            ZipCode:Joi.string().optional().allow(''),
                            Country:Joi.string().optional().allow('')
                        },
                        locationLatitude:Joi.string(),
                        locationLongitude:Joi.string(),
                             dob : Joi.string(),
                    profilePhoto: Joi.any()
                        .meta({swaggerType: 'file'})
                        //.required()
                        .description('image file'),
                },
                    failAction:commonFunction.failActionFunction
                },

                plugins:{
                    'hapi-swagger':{
                        payloadType:'form',
                        responseMessages:swaggerDefaultResponseMessages
                    }
                }
            }
        },
        {
            method: 'PUT',
            path: '/users/profile',
            config: {
                auth: false,
                handler: userHandler.updateUserProfile,
                //swagger related
                description: 'Update User',
                notes: 'Updates User identified by the id passed in parameter',
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        //payloadType:'form',
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
                    payload:{
                        user_id         : Joi.string().required(),
                        user_email      : Joi.string().required(),
                        card_type       :Joi.string().required(),
                        image           : Joi.any()
                            .meta({swaggerType: 'file'})
                            .description('image file'),
                        cards           : Joi.object({
                            card       : Joi.string().description("Add card ID here").required(),
                            fields     : Joi.object().required()
                        })
                    },
                    headers: Joi.object().unknown()
                },
            }
        },
        {
            method: 'GET',
            path: '/users/profile',
            config: {
                auth: false,
                handler: userHandler.getUserProfile,
                //swagger related
                description: 'get User Profile Cards',
                notes: 'Get Users Profile Cards',
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    query:{
                        user_id         : Joi.string().required(),
                    },
                    headers: Joi.object().unknown()
                },
            }
        },
        {
            method: 'PUT',
            path: '/users/forgotPassword',
            handler: userHandler.forgotPasswordHandler,
            config: {
                description: 'Sends Forgot Password Link To Email ',
                tags: ['api', 'user'],
                auth: false,
                validate: {
                    payload: {
                        email: Joi.string().email().required()
                    },
                    failAction: commonFunction.failActionFunction
                },
                plugins: {
                    'hapi-swagger': {
                        payloadType: 'form',
                        responseMessages: swaggerDefaultResponseMessages
                    }
                }
            }
        },
        {
            method:'POST',
            path:'/users/favourite',
            config:{
                auth:false,
                handler:userHandler.userFavourite,
                description:'add gigs to the favourite list',
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
                        seeker_id:Joi.string().required(),
                        gig_id:Joi.array().required(),
                        service_id:Joi.string().required(),
                    },
                    options:{
                        abortEarly:false, allowUnknown:true
                    }
                },

            }

        },
        {
            method:'PUT',
            path:'/users/favourite/serviceremove',
            config:{
                auth:false,
                handler:userHandler.removeFavouriteService,
                description:'remove services from the favourite list',
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
                        seeker_id:Joi.string().required(),
                        //gig_id:Joi.array().required(),
                        service_id:Joi.string().required(),
                    },
                    options:{
                        abortEarly:false, allowUnknown:true
                    }
                },

            }

        },
        {
            method:'PUT',
            path:'/users/favourite/gigremove',
            config:{
                auth:false,
                handler:userHandler.removeFavouriteGig,
                description:'remove gigs from the favourite list',
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
                        seeker_id:Joi.string().required(),
                        gig_id:Joi.array().required(),
                       // service_id:Joi.string().required(),
                    },
                    options:{
                        abortEarly:false, allowUnknown:true
                    }
                },

            }

        },
        /*{
            method:'GET',
            path:'/users/favourites',
            config:{
                auth:false,
                handler:userHandler.getUserFavourite,
                //swagger
                description:'get favourite gigs',
                notes: 'get favourite gigs',
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        payloadType:'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                     query:{
                        seeker_id:Joi.string().required(),
                       
                        
                    },
                    options: {
                        abortEarly:false, allowUnknown:true
                    }
                },
            }
        },*/
        {
            method: 'PUT',
            path: '/users/resetPassword',
            handler:userHandler.resetPasswordUser ,
            config: {
                description: 'Reset Password For Users',
                tags: ['api', 'user'],
                auth: false,
                validate: {
                    payload: {
                        email: Joi.string().email().required(),
                        passwordResetToken: Joi.string().required(),
                        newPassword: Joi.string().min(5).required()
                    },
                    failAction: commonFunction.failActionFunction
                },
                plugins: {
                    'hapi-swagger': {
                        payloadType:'form',
                        responseMessages:swaggerDefaultResponseMessages
                    }
                }
            }
        },
        {
            method: 'PUT',
            path: '/users/changepassword',
            handler:userHandler.changePasswordUser ,
            config: {
                description: 'Change Password For Users',
                tags: ['api', 'user'],
                auth: false,
                validate: {
                    payload: {
                        email: Joi.string().email().required(),
                        old_password : Joi.string().required(),
                        new_password : Joi.string().required()
                    },
                    failAction: commonFunction.failActionFunction
                },
                plugins: {
                    'hapi-swagger': {
                        payloadType:'form',
                        responseMessages:swaggerDefaultResponseMessages
                    }
                }
            }
        },
        //{
        //    method: 'PUT',
        //    path: '/users/resendOTP',
        //    handler: function (request, reply) {
        //        //const userData = request.auth && request.auth.credentials && request.auth.credentials.userData || null;
        //        userHandler.resendOTPUser(userData, function (err) {
        //            if (err) {
        //                reply(err);
        //            } else {
        //                reply("Success").code(200)
        //            }
        //        });
        //    },
        //    config: {
        //        description:'Resend The OTP',
        //        tags:['users','api'],
        //        auth: false,
        //        validate: {
        //            failAction: commonFunction.failActionFunction
        //        },
        //        plugins: {
        //            'hapi-swagger': {
        //                responseMessages: swaggerDefaultResponseMessages
        //            }
        //        }
        //    }
        //},
        {
            method: 'GET',
            path: '/users/cards',
            config: {
                auth: 'token1',
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
            path: '/users/masterservices',
            config: {
                auth: false,
                handler: userHandler.getMasterServicesUsers,
                //swagger related
                description: 'Get list of all users services',
                notes: 'Returns data of all services',
                tags: ['api','users'],
                plugins: {
                    'hapi-swagger': {
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    //headers: {
                    //    Authorization : Joi.string().description('access token is required.')
                    //},
                    options: {
                        abortEarly:false, allowUnknown:true
                    }
                }
            }
        },
        {
            method: 'GET',
            path: '/users/getGigs',
            config: {
                auth: false,
                handler: userHandler.getGigsHandler,
                //swagger related
                description: 'Get Gigs list of all services',
                notes: 'Returns data of allGigs depending upon filter provided as ServiceID',
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        payloadType:'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    query:{
                        serviceID:Joi.string().required()
                    },
                    options: {
                        abortEarly:false, allowUnknown:true
                    }
                }
            }
        },
        {
            method: 'PUT',
            path: '/users/organization',
            config: {
                auth: 'token1',
                handler: userHandler.addOrganizationData,
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
                            org_country_code   : Joi.string(),
                            ssn           : Joi.string(),
                            federal_id    : Joi.string(),
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
            path: '/users/organization/bankdetails',
            config: {
                auth: 'token1',
                handler: userHandler.addBankDetails,
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
                        user_id : Joi.string().required(),
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
                            }
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
            path: '/users/organization/insurancedetails',
            config: {
                auth: 'token1',
                handler: userHandler.addInsuranceDetails,
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
                        user_id : Joi.string().required(),
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
            method: 'PUT',
            path: '/users/notification',
            handler: userHandler.toggleNotificationFlag,
            config: {
                auth: 'token1',
                //swagger related
                description: "Activate or deactivate user Notification flag in his Profile.Notification flag present in param.",
                notes: "Activate or deactivate User dicount flag in his Profile. Seeker/Provider notification flag will be toggled on the basis of role fetched by access token",
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        //payloadType: 'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    payload: {notification_flag : Joi.bool().required()},
                    headers: {
                        Authorization : Joi.string().description('access token is required.')
                    },
                    options: {abortEarly: false, allowUnknown: true}
                },
            }
        },
        {
            method: 'PUT',
            path: '/users/bgccheck',
            handler: userHandler.toggleBGCFlag,
            config: {
                auth: false,
                //swagger related
                description: "Activate or deactivate user BGC flag in his Profile.BGC flags present in payload.",
                notes: "Activate or deactivate user BGC flag in his Profile.",
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        //payloadType: 'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    payload: {
                        user_id             : Joi.string(),
                        id_check            : Joi.bool(),
                        criminal_clearance  : Joi.bool(),
                        sex_offender_clearance : Joi.bool()
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
            path: '/users/promotions',
            config: {
                auth: false,
                handler: userHandler.getAllPromotions,
                //swagger related
                description: 'Get All Promotions list',
                notes: 'Get All Promotions list',
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
                }
            }
        },
        {
            method: 'PUT',
            path: '/users/favourites',
            config: {
                auth: 'token1',
                handler: userHandler.makeFavourites,
                //swagger related
                description: 'Make Favourites For Users',
                notes: "Make Favourites For Users ",
                tags: ['api', 'user'],
                plugins: {
                    'hapi-swagger': {
                        //payloadType: 'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    payload: {
                        user_id : Joi.string().required(),
                        service_id : Joi.string().required(),
                        gig_id : Joi.string().required()
                    },
                    headers: {
                        Authorization : Joi.string().description('access token is required.')
                    },
                    options: {abortEarly: false, allowUnknown: true}
                },
            }
        },
        /*{
            method: 'GET',
            path: '/users/favourites/services',
            handler:userHandler.getFavouriteServices ,
            config: {
                description: 'GET Favourite Services For Users',
                tags: ['api', 'user'],
                auth: 'token1',
                validate: {
                    query: {
                        user_id : Joi.string().required()
                    },
                    headers: {
                        Authorization : Joi.string().description('access token is required.')
                    },
                    failAction: commonFunction.failActionFunction
                },
                plugins: {
                    'hapi-swagger': {
                        payloadType:'form',
                        responseMessages:swaggerDefaultResponseMessages
                    }
                }
            }
        },*/
        {
            method: 'GET',
            path: '/users/favourites/services',
            config: {
                auth: 'token1',
                handler: userHandler.getFavouriteServices,
                //swagger related
                description: 'GET Favourite Services For Users',
                notes: "GET Favourite Services For Users",
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        //payloadType: 'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    query: {
                        user_id : Joi.string().required()
                    },
                    headers: {
                        Authorization : Joi.string().description('access token is required.')
                    },
                    options: {abortEarly: false, allowUnknown: true}
                },
            }
        },
        {
            method: 'GET',
            path: '/users/favourites/{service_id}/gigs',
            config: {
                auth: 'token1',
                handler: userHandler.getAllFavGigsForSpecificService,
                //swagger related
                description: "Get all gigs for particular services Favourite by user",
                notes: " Get all gigs for particular services Favourite by user.API Created at : MON JUNE 19 2017 16:03:16",
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
        {
            method: 'PUT',
            path: '/users/language',
            config: {
                auth: 'token1',
                handler: userHandler.setLanguageParam,
                //swagger related
                description: 'Set Language for Users',
                notes: "Set Language for Users ",
                tags: ['api', 'user'],
                plugins: {
                    'hapi-swagger': {
                        //payloadType: 'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    payload: {
                        user_id : Joi.string().required(),
                        language : Joi.string().valid('EN','SP').required(),
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
            path: '/users/wallet',
            config: {
                auth: 'token1',
                handler: userHandler.AddOrDeductWalletAmountByUserId,
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
                        Authorization: Joi.string().description('User access token is required.')
                    },
                    options: {
                        abortEarly: false, allowUnknown: true
                    }
                }
            },
        },
        {
            method: 'GET',
            path: '/users/wallet',
            config: {
                auth: 'token1',
                handler: userHandler.getWalletCreditByUserId,
                //swagger related
                description: 'GET users wallet amount',
                notes: 'GET users wallet amount',
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    query: {
                        user_id: Joi.string().required().description(
                            'user_id is required.')
                    },
                    headers: {
                        Authorization: Joi.string().description('User access token is required.')
                    },
                    options: {
                        abortEarly: false, allowUnknown: true
                    }
                }
            },
        }
    ]);

    next();
}


module.exports.register.attributes = {
    name: 'futrun-users-module',
    version: '0.0.1'
};
