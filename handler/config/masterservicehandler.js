/**
 * Created by cl-macmini-63 on 1/21/17.
 */
'use strict';

const masterServiceModel = require( 'model/masterservice.js' );

const  log = require('Utils/logger.js');
const logger = log.getLogger();

const responseFormatter = require('Utils/responseformatter');


module.exports={};


module.exports.createMasterServices = function(request, reply){
    console.log("in handler creating master services payload :::  ",request.payload);
    masterServiceModel.createMasterServices(request.payload , function(response){
        if(response.status == 'success'){
            reply(response);
        }
        else{
            console.log('error in createMasterServices',response);
            reply(response);
        }
    });
};

module.exports.getMasterServices = function(request, reply){
    console.log("in handler getMasterServices :::  ");
    masterServiceModel.getMasterServices(function(response){
        if(response.status == 'success'){
            reply(response);
        }
        else{
            console.log('error in createMasterServices',response);
            reply(response);
        }
    });
};

module.exports.updateMasterService = function(request, reply){
    console.log("in handler updateMasterService :::  ",request.payload);
    masterServiceModel.updateMasterService(request.payload , function(err,data){
        if(err){
            reply(err);
        }
        else{
            console.log('error in updateMasterService',data);
            responseFormatter.formatServiceResponse(data, reply , 'Updated Gig data ', 'success',200);
        }
    });
};

module.exports.activateMasterService = function(request, reply){
    console.log("in handler activateMasterService :::  ",request.payload);
    masterServiceModel.activateMasterService(request.payload , function(response){
        if(response.status == 'success'){
            reply(response);
        }
        else{
            console.log('error in updateMasterService',response);
            reply(response);
        }
    });
};



