/**
 * Created by clicklabs on 6/12/17.
 */

'use strict';
var organizationTypeModel =require('model/organizationtypemodel');
const  log = require('Utils/logger.js');
const logger = log.getLogger();

const responseFormatter = require('Utils/responseformatter');


module.exports={};
module.exports.setOrganizationTypes = function(request,reply){
    let payload = request.payload;
    organizationTypeModel.setOrganizationTypes(payload,function(err,data){
        if(err){
            reply(err)
        }
        else{
            responseFormatter.formatServiceResponse(data, reply, "OrganizationTypes inserted successfully " , "Success",200)
        }
    })
}
module.exports.getOrganizationTypes = function(request,reply){
    organizationTypeModel.getOrganizationTypes(function(err,data){
        if(err){
            reply(err)
        }
        else{
            responseFormatter.formatServiceResponse(data, reply, "" , "Success",200)
        }
    })
}