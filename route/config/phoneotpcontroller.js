/**
 * Created by cl-macmini-63 on 1/18/17.
 */

'use strict';

const phoneotpHandler = require( 'handler/config/phoneotphandler.js' );

const phoneotpSchema = require('schema/mongo/phoneotp');

const HttpErrors = require('Utils/httperrors.js');

var Joi = require('joi');


module.exports={};


module.exports.register = function(server, options, next) {

    server.route([
        {
            method: 'POST',
            path: '/otp/phone',
            config:{
                auth: false,
                handler: phoneotpHandler.sendOtpToPhone,
                //swagger related
                description: 'send OTP',
                notes: 'this api will send a otp. Phone Number will be present in body payload',
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    payload : {
                        phone : Joi.string().required(),
                        countryCode:Joi.string().required(),
                    }
                }
            }
        },
        {
            method: 'POST',
            path: '/otp/email',
            config:{
                auth: false,
                handler: phoneotpHandler.sendOtpToEmail,
                //swagger related
                description: 'send OTP',
                notes: 'this api will send a otp. Phone Number will be present in body payload',
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    payload : Joi.object({email : Joi.string().required()})
                        .required()
                        .description('Email is required')
                }
            }
        },
        {
            method: 'POST',
            path: '/otp/phone/verification',
            config:{
                auth: false,
                handler: phoneotpHandler.verifyPhoneOTP,
                //swagger related
                description: 'Verify OTP',
                notes: 'Verify OTP , OTP will be present in body payload',
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    payload : Joi.object({otp : Joi.string().required(),
                                phone : Joi.string().required(),
                                countryCode:Joi.string().optional().allow('')
                    })
                        .required()
                        .description('OTP is required')
                }
            }
        },
        {
            method: 'POST',
            path: '/otp/email/verification',
            config:{
                auth: false,
                handler: phoneotpHandler.verifyEmailOTP,
                //swagger related
                description: 'Verify OTP',
                notes: 'Verify OTP , OTP will be present in body payload',
                tags: ['api'],
                plugins: {
                    'hapi-swagger': {
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    payload : Joi.object({otp : Joi.string().required(),
                        email : Joi.string().required()})
                        .required()
                        .description('OTP is required')
                }
            }
        }
        
    ]);

    next();
}

module.exports.register.attributes = {
    name: 'futrun-phoneotp-module',
    version: '0.0.1'
};
