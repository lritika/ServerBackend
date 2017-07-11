/**
 * Created by clicklabs on 6/15/17.
 */

'use strict';
const responseFormatter = require('Utils/responseformatter.js');
const promotionSchema = require('schema/mongo/promotionschema');
const  log = require('Utils/logger.js');
var config=require('../config');
const logger = log.getLogger();
const shortid = require('shortid');
let AWS = config.amazon.s3;
const async = require('async');
const commonFunction = require('Utils/commonfunction.js');
let moment=require('moment');


module.exports.createNewPromotion = function (payload, callback) {
    console.log('payload',payload);
    console.log('typeOf payload ',typeof payload);
    console.log('payload.promo_details.',payload.promo_details);
    console.log('payload.promo_details.provider_id',payload.promo_details.provider_id);
    let promoDetails = payload.promo_details;
    let finalData = null
    async.series([
        function (cb) {
            if (payload.hasOwnProperty("promo_image") && payload.promo_image) {
                let fileName = payload.promo_image.filename;
                let tempPath = payload.promo_image.path;
                if (typeof payload.promo_image !== 'undefined' && payload.promo_image.length) {
                    fileName = payload.promo_image[1].filename;
                    tempPath = payload.promo_image[1].path;
                }
                console.log("tempPath", fileName)

                commonFunction.uploadFile(tempPath, fileName, "aLarge", function (err) {

                    if (err) {
                        cb(err);
                    }
                    else {

                        let x = fileName;

                        let fileNameFirst = x.substr(0, x.lastIndexOf('.'));
                        let extension = x.split('.').pop();

                        promoDetails.promo_image = {
                            original: AWS.s3URL + AWS.folder.aLarge + "/" + fileName,
                            thumbnail: AWS.s3URL + AWS.folder.aLarge + "/" + fileNameFirst + "_thumb." + extension
                        };
                        console.log("file upload success", promoDetails.promo_image);
                        console.log("promo_image");
                        cb(null)
                    }
                });
            }
            else {
                cb(null);
            }
        },
        function (cb) {

            //let validFromMoment = moment.utc(promoDetails.valid_from).local();
            //let validUptoMoment = moment.utc(promoDetails.valid_upto).local();
            //console.log('validFromMoment : ',validFromMoment,"  validUptoMoment :: ",validUptoMoment);
            //promoDetails.valid_from = validFromMoment;
            //promoDetails.valid_upto = validUptoMoment;
            console.log("async series promoDetails", promoDetails);
            console.log('promoDetails.provider_id',promoDetails.provider_id);
            console.log('promoDetails.no_of_coupons',promoDetails.no_of_coupons);
            let newPromotion = new promotionSchema.Promotion(promoDetails);

            let promo_code = shortid.generate();
            console.log("promo_code ----> ",promo_code);
            newPromotion.promo_code = promo_code;
            newPromotion.count_remaining = Number(promoDetails.no_of_coupons);
            newPromotion.save(function(err,savedPromotion) {
                if (err) {
                    responseFormatter.formatServiceResponse(err, callback);
                }
                else {
                    console.log("newPromotion savedData______", savedPromotion);
                    finalData = savedPromotion;
                    cb(null);
                }
            })
        }
    ], function (err, data) {
        if (err) {
            callback(err)
        }
        else {
            data = finalData;
            console.log("final data after series", data)
            callback(null, data);
        }
    })
}

module.exports.getAllPromotionsByproviderId = function (provider_id , callback) {
    promotionSchema.Promotion.find({provider_id : provider_id}, {}, {lean: true}, function (err, data) {
        if (err) {
            callback(err)
        }
        else {
            if (!data || data.length == 0) {
                responseFormatter.formatServiceResponse([], callback, "Promotions not found", "error", 400)
            }
            else {

                for(var i = 0 ; i< data.length; i++){
                    if(data[i].valid_upto < new Date()){
                        data[i].expired_flag = true;
                    }
                }
                console.log("--------***Data", data);
                responseFormatter.formatServiceResponse(data, callback, "Promotions fetched successfully", "success", 200);
                //callback(null, data)

            }
        }
    })
}