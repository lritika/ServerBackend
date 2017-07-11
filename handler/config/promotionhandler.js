/**
 * Created by clicklabs on 6/15/17.
 */

'use strict';
var promotionModel =require('model/promotionmodel.js');
const  log = require('Utils/logger.js');
const logger = log.getLogger();

const responseFormatter = require('Utils/responseformatter');


module.exports={};

module.exports.createNewPromotion = function(request,reply){
    let payload = request.payload;
    promotionModel.createNewPromotion(payload,function(err,data){
        if(err){
            responseFormatter.formatServiceResponse(err, reply, "Error Occurred" , "error",400);
            //reply(err)
        }
        else{
            responseFormatter.formatServiceResponse(data, reply, "New Promotion created successfully " , "Success",200)
        }
    })
};

module.exports.getAllPromotionsByproviderId = function(request,reply){
    let provider_id = request.query.provider_id;
    promotionModel.getAllPromotionsByproviderId(provider_id,function(err,data){
        if(err){
            reply(err)
        }
        else{
            responseFormatter.formatServiceResponse(data, reply, "" , "Success",200)
        }
    })
}