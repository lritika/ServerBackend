/**
 * Created by clicklabs on 6/15/17.
 */

'use strict'
const Joi = require('joi');

//create logger
const log = require('Utils/logger.js');
const logger = log.getLogger();

const promotionHandler = require( 'handler/config/promotionhandler.js' );
const HttpErrors = require('Utils/httperrors.js');

module.exports.register = function(server, options, next) {

    server.route([
        {
            method: 'POST',
            path: '/promotions',
            config: {
                auth: 'token1',
                handler: promotionHandler.createNewPromotion,
                //swagger related
                description: 'Create New Promotion for gig by SP',
                notes: 'Create New Promotion for gig by SP. Create a random system-generated promo code',
                tags: ['api','promo'],
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
                        promo_details  : Joi.object({
                            gig_id       : Joi.string(),
                            service_id   : Joi.string(),
                            provider_id  : Joi.string(),
                            promotion_type    : Joi.string().valid(['percentage' , 'fixed_amount']),
                            promotion_value   : Joi.number(),
                            valid_from   : Joi.date(),
                            valid_upto   : Joi.date(),
                            no_of_coupons : Joi.number()
                        }),
                        promo_image : Joi.any().meta({swaggerType: 'file'}).required().description('Image of promo coupon')
                    },
                    headers: {
                        Authorization : Joi.string().description('SP access token is required.')
                    },
                    options: {abortEarly: false, allowUnknown: true}
                }
            }
        },
        {
            method:'GET',
            path:"/promotions",
            config:{
                auth:false,
                handler:promotionHandler.getAllPromotionsByproviderId,
                description: 'Get All Promotions by provider id',
                notes: 'Get All Promotions by provider id',
                tags: ['api','promo'],
                plugins: {
                    'hapi-swagger': {
                        payloadType: 'form',
                        responseMessages: HttpErrors.standardHTTPErrors
                    }
                },
                validate: {
                    query:{
                      provider_id : Joi.string().required()
                    },
                    options: {abortEarly: false, allowUnknown: true,}
                }

            }

        }
    ])

    next();
}


module.exports.register.attributes = {
    name: 'futrun-promo-module',
    version: '0.0.1'
};