/**
 * Created by clicklabs on 6/20/17.
 */

'use strict';
var supportModel =require('model/supportmodel.js');
const  log = require('Utils/logger.js');
const logger = log.getLogger();

const responseFormatter = require('Utils/responseformatter');


module.exports={};

module.exports.addSupportInfo = function(request,reply){
    let payload = request.payload;
    supportModel.addSupportInfo(payload,function(err,data){
        if(err){
            responseFormatter.formatServiceResponse(err, reply, "Error Occurred" , "error",400);
            //reply(err)
        }
        else{
            responseFormatter.formatServiceResponse(data, reply, "Support Info Added successfully " , "Success",200)
        }
    })
};

module.exports.getSupportInfo = function(request,reply){
    supportModel.getSupportInfo(function(err,data){
        if(err){
            reply(err)
        }
        else{
            responseFormatter.formatServiceResponse(data, reply, "" , "Success",200)
        }
    })
}