/**
 * Created by clicklabs on 6/22/17.
 */

'use strict';
var userReffralCodeModel =require('model/userreffralcodemodel.js');
const  log = require('Utils/logger.js');
const logger = log.getLogger();

const responseFormatter = require('Utils/responseformatter');


module.exports={};

module.exports.createReffralCode = function(request,reply){
    let payload = request.payload;
    userReffralCodeModel.createReffralCode(payload,function(err,data){
        if(err){
            responseFormatter.formatServiceResponse(err, reply, "Error Occurred" , "error",400);
            //reply(err)
        }
        else{
            responseFormatter.formatServiceResponse(data, reply, "User Reff Code created successfully" , "Success",200)
        }
    })
};

module.exports.applyReffralCode = function(request,reply){
    let payload = request.payload;
    let current_role = request.payload.reg_as;
    userReffralCodeModel.applyReffralCode(payload,current_role,function(err,data){
        if(err){
            responseFormatter.formatServiceResponse(err, reply, "Error Occurred" , "error",400);
            //reply(err)
        }
        else{
            if(data.status == 'error'){
                responseFormatter.formatServiceResponse({}, reply, data.message , "error",404)
            }else{
                responseFormatter.formatServiceResponse(data, reply, "User Reff Code applied successfully" , "Success",200)
            }

        }
    })
};