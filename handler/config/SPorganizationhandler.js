/**
 * Created by clicklabs on 6/7/17.
 */

'use strict';

const SPOrganizationModel =require('model/SPorganizationmodel');

const  log = require('Utils/logger.js');
const logger = log.getLogger();
let config=require('config')
const responseFormatter = require('Utils/responseformatter');

module.exports={};


module.exports.addOrganizationData = function(request, reply){
    SPOrganizationModel.addOrganizationData(request.payload , function(err,data){
        if(err){
            reply(err)
        }
        else{
            responseFormatter.formatServiceResponse(data,reply, 'SP Organization Inserted Successfully','success',200);
        }
    });
};

module.exports.addBankDetails = function(request, reply){
    SPOrganizationModel.addBankDetails(request.payload , function(err,data){
        if(err){
            reply(err)
        }
        else{
            responseFormatter.formatServiceResponse(data,reply, 'SP Organization Bank Details Inserted Successfully','success',200);
        }
    });
};

module.exports.addInsuranceDetails = function(request, reply){
    SPOrganizationModel.addInsuranceDetails(request.payload , function(err,data){
        if(err){
            reply(err)
        }
        else{
            if(data){
                responseFormatter.formatServiceResponse(data,reply, 'SP Organization Insurance Details Inserted Successfully','success',200);
            }else{
                responseFormatter.formatServiceResponse(data,reply, 'SP Organization Profile not found','error',404);

            }
        }
    });
};