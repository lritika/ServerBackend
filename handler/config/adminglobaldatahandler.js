/**
 * Created by cl-macmini-149 on 03/05/17.
 */

'use strict';

var adminGlobalDataModel =require('model/adminglobaldatamodel.js')

const  log = require('Utils/logger.js');
const logger = log.getLogger();

const responseFormatter = require('Utils/responseformatter');

module.exports={};
module.exports.addGlobalData = function(request,reply){
    let payload = request.payload;
    console.log('payload  in adminglobaldatahandler ::: ',payload);
    adminGlobalDataModel.addGlobalData(payload,function(err,data){
        if(err){
            reply(err)
        }
        else{
            responseFormatter.formatServiceResponse(data,reply, 'Fetched successfully','success',200);
        }
    })

}

module.exports.editGlobalData = function(request,reply){
    let payload = request.payload;
    console.log('payload  in editGlobalData ::: ',payload);
    adminGlobalDataModel.editGlobalData(payload,function(err,data){
        if(err){
            reply(err)
        }
        else{
            responseFormatter.formatServiceResponse(data,reply, 'Fetched successfully','success',200);
        }
    })

}

module.exports.getGlobalData = function(request,reply){
    adminGlobalDataModel.getGlobalData(function(err,data){
        if(err){
            reply(err)
        }
        else{
            responseFormatter.formatServiceResponse(data,reply, 'Fetched successfully','success',200);
        }
    })

}
