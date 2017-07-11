/**
 * Created by cl-macmini-149 on 07/02/17.
 */
'use strict';
const adminModel = require( 'model/admin.js' );
var locationModel =require('model/location')

const Boom = require('boom');

const  log = require('Utils/logger.js');
const logger = log.getLogger();

const responseFormatter = require('Utils/responseformatter');


module.exports={};
module.exports.getGigsLocation=function(request,reply){
    let payload=request.query
    locationModel.locationGigsModel(payload,function(err,data){
        if(err){
            reply(err)
        }
        else{
            responseFormatter.formatServiceResponse(data, reply, "" , "Success",200)
        }
    })
}
module.exports.getServiceLocation=function(request,reply){
    let payload=request.query
    locationModel.locationServiceModel(payload,function(err,data){
        if(err){
            reply(err)
        }
        else{
            responseFormatter.formatServiceResponse(data, reply, "" , "Success",200)
        }
    })
}