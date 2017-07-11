/**
 * Created by cl-macmini-63 on 1/19/17.
 */
'use strict';
const adminModel = require( 'model/admin.js' );

const Boom = require('boom');

const  log = require('Utils/logger.js');
const logger = log.getLogger();
let config=require('config')
const responseFormatter = require('Utils/responseformatter');
module.exports={};

/**
 * Handler for authentication request
 */

module.exports.authenticateAdmin = function(request, reply){
    var payload = request.payload;
    adminModel.authenticateAdmin (payload.email.toLowerCase(), payload.password, payload.current_role,function(response){
        //logger.debug('Authentication response: ', response);
        if (response.status == 'error'){
            if (response.error_type = 'AuthenticationError'){
                reply(Boom.unauthorized(response.message));
            }
            else{
                reply(Boom.badImplementation('Unable to authentication admin: ' + response.message));
            }
        }
        else{
            console.log("In Auth Controller authenticateAdmin :",response);
            reply(response);
        }


    });
}

module.exports.createAdmin = function(request, reply){
    var payload = request.payload;
    console.log('payload ::  ',payload);
    adminModel.createAdmin(payload, function(response){
        logger.debug("In Controller user returned by create:", response);
        try{
            if (response === null || response === undefined){
                reply(Boom.badImplementation("Admin could not be created"));
            }
            else{
                //logger.debug("user returned by create:", user);
                if (response.status == 'success'){
                    reply(response);
                }
                else{
                    if (response.error_type == 'validation_error'){
                        responseFormatter.formatValidationErrorResponse(response.data,reply);
                    }
                    else{
                        reply(Boom.badImplementation(response.msg,response.data));
                    }
                }
            }
        }
        catch(e){
            logger.error("Error creating Admin: " + e.message);
            reply(Boom.badImplementation(e.message));
        }
    });
};
module.exports.addCodesHandler=function(request,reply){
    let payload=request.payload
    adminModel.addCodesModel(payload,function(err,data){
        if(err){
            reply(err)
        }
        else{
            reply(data)
        }
    })
}

module.exports.updateConstantHandler=function(request,reply){
    let payload=request.payload
    adminModel.updateConstantModel(payload,function(err,data){
        if(err){
            reply(err)
        }
        else{
            responseFormatter.formatServiceResponse(data,reply, config.constants.messages.Success.insertion,'success',200);
        }
    })
}

module.exports.getConstantHandler=function(request,reply){
    adminModel.getConstantModel(function(err,data){
        if(err){
            reply(err)
        }
        else{
            responseFormatter.formatServiceResponse(data,reply, config.constants.messages.Success.get,'success',200);
        }
    })
}
module.exports.addConstantHandler=function(request,reply){
    let payload=request.payload
    adminModel.addConstantModel(payload,function(err,data){
        if(err){
            reply(err)
        }
        else{
            responseFormatter.formatServiceResponse(data,reply, config.constants.messages.Success.insertion,'success',200);
        }
    })
}

module.exports.getCodesHandler=function(request,reply){
    adminModel.getCodesModel(function(err,data){
        if(err){
            reply(err)
        }
        else{
            responseFormatter.formatServiceResponse(data,reply, config.constants.messages.Success.get,'success',200);
        }
    })
}
module.exports.getMappedCodes=function(request,reply){
    adminModel.getMappedCodesModel(function(err,data){
        if(err){
            reply(err)
        }
        else{
            responseFormatter.formatServiceResponse(data,reply, config.constants.messages.Success.get,'success',200);
        }
    })
}
//module.exports.updateCodesHandler=

module.exports.getAllSeekers=function(request,reply){
    adminModel.getAllSeekers(function(err,data){
        if(err){
            responseFormatter.formatServiceResponse(err,reply, config.constants.messages.error.dbError,'error',400);
        }
        else{
            if(data && data.length!=0){
                responseFormatter.formatServiceResponse(data,reply, config.constants.messages.Success.get,'success',200);
            }else{
                responseFormatter.formatServiceResponse(data,reply, 'No Seekers Found','success',200);
            }

        }
    })
}
module.exports.getAllProviders=function(request,reply){
    adminModel.getAllProviders(function(err,data){
        if(err){
            responseFormatter.formatServiceResponse(err,reply, config.constants.messages.error.dbError,'error',400);
        }
        else{
            if(data && data.length!=0){
                responseFormatter.formatServiceResponse(data,reply, config.constants.messages.Success.get,'success',200);
            }else{
                responseFormatter.formatServiceResponse(data,reply, 'No Providers Found','success',200);
            }

        }
    })
}

module.exports.getUserDetailsByUserId = function(request,reply){
    let user_id = request.params.user_id;
    adminModel.getUserDetailsByUserId(user_id,function(err,data){
        if(err){
            responseFormatter.formatServiceResponse(err,reply, config.constants.messages.error.dbError,'error',400);
        }
        else{
            if(data && data.length!=0){
                responseFormatter.formatServiceResponse(data,reply, config.constants.messages.Success.get,'success',200);
            }else{
                responseFormatter.formatServiceResponse(data,reply, 'No Details Found','success',200);
            }

        }
    })
}

module.exports.AddOrDeductWalletAmountByUserId = function(request,reply){
    let user_id = request.payload.user_id;
    let amount = request.payload.amount;
    adminModel.AddOrDeductWalletAmountByUserId(request.payload,function(err,data){
        if(err){
            responseFormatter.formatServiceResponse(err,reply, config.constants.messages.error.dbError,'error',400);
        }
        else{
            if(data && data.length!=0){
                responseFormatter.formatServiceResponse(data,reply, config.constants.messages.Success.get,'success',200);
            }else{
                responseFormatter.formatServiceResponse(data,reply, 'No Details Found','success',200);
            }

        }
    })
}
module.exports.approveProviderByProfileId = function(request,reply){
    let profile_id = request.payload.profile_id;
    adminModel.approveProviderByProfileId(profile_id ,function(err,data){
        if(err){
            responseFormatter.formatServiceResponse(err,reply, config.constants.messages.error.dbError,'error',400);
        }
        else{
            if(data && data.length!=0){
                responseFormatter.formatServiceResponse(data,reply, config.constants.messages.Success.get,'success',200);
            }else{
                responseFormatter.formatServiceResponse(data,reply, 'No Profile Details Found','success',200);
            }

        }
    })
}

module.exports.changeUserStatusByUserId = function(request,reply){
    adminModel.changeUserStatusByUserId(request.payload ,function(err,data){
        if(err){
            responseFormatter.formatServiceResponse(err,reply, config.constants.messages.error.dbError,'error',400);
        }
        else{
            if(data && data.length!=0){
                responseFormatter.formatServiceResponse(data,reply, config.constants.messages.Success.get,'success',200);
            }else{
                responseFormatter.formatServiceResponse(data,reply, 'No User Details Found','success',200);
            }

        }
    })
}

