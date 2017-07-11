/**
 * Created by cl-macmini-63 on 1/16/17.
 */
'use strict';
const userModel = require( 'model/user.js' );

const Boom = require('boom');

const  log = require('Utils/logger.js');
const logger = log.getLogger();
const commonFunction=require('Utils/commonfunction.js')
const messenger=require('Utils/messenger')
const responseFormatter = require('Utils/responseformatter');
var async=require('async')
var config=require('config')

module.exports={};


module.exports.createNewUser = function(request, reply){
    var payload = request.payload;
    console.log('payload ::  ',payload);
    userModel.createNewUser(payload, function(response){
        console.log("In Controller user returned by create:", response);
        //try{
        //    if (response === null || response === undefined){
        //        reply(Boom.badImplementation("User could not be created"));
        //    }
        //    else{
        //        //logger.debug("user returned by create:", user);
        //        if (response.status == 'success'){
        //            reply({statusCode:200, message: "created successFully", data: response || null});
        //        }
        //        else{
        //
        //            if (response.error_type == 'validation_error'){
        //                responseFormatter.formatServiceResponse(response.data,reply);
        //            }
        //            else{
        //                reply(response);
        //            }
        //        }
        //    }
        //}
        //catch(e){
        //    logger.error("Error creating user: " + e.message);
        //    reply(Boom.badImplementation(e.message));
        //}
        //if(response.status == 'success'){
        //    reply(response);
        //}
        ////responseFormatter.formatServiceResponse(response, reply,'OTP sent Successfully on your phone', 'success',200);
        //else{
        //    console.log('error in sendOTP');
        //    reply(response);
        //    //responseFormatter.formatServiceResponse('', reply,'Error occured. Otp sending failed.', 'error');
        //}
        reply(response)
    });
};

module.exports.getUser = function(request, reply){
    logger.debug('Calling getUser');
    logger.debug('request.params.userid',request.params.user_id);
    userModel.getUserById(request.params.user_id, request.auth.credentials,
        function(response){
            console.log('Response Get User:', response);
            try{
                //if not data, implies user not found
                if (response.data == null || response.data == undefined || response.data == ''){
                    reply(Boom.notFound("User not found"));
                }
                else{
                    reply(response);
                }
            }
            catch(e){
                logger.error('Error finding user: ', e.message);
                reply(Boom.notFound(e.message));
            }

        }
    );
};
module.exports.createUserHandler=function(request,reply){
    const payloadData=request.payload
    userModel.createUserModel(payloadData,function(err,data){
        if(err){
          console.log('error',err);
          reply(err)
      }
        else{
          console.log("data___",data)
          //responseFormatter.formatServiceResponse({}, reply, err.message,'success',err.statusCode);
          responseFormatter.formatServiceResponse({}, data, 'User Registered SuccessFully','Success',data.statusCode);
      }
    })
}
//module.exports.forgotPasswordUser = function (payloadData, callback) {
//    let emailData=null
//    var resetToken=commonFunction.generateRandomStringBigger()
//    var passwordUpdated=null
//    async.series([
//        //Check Whether Atleast one field entered
//        function(cb){
//            const criteria={
//                email:payloadData.email
//            }
//            const options={
//                lean:true
//            }
//            userModel.getUser(criteria,{},options,function(err,data){
//                if(err){
//                    cb(err)
//                }
//                else{
//                    console.log(!data)
//                if(!data){
//                    cb(config.messages.errors.notFound.EMAIL_NOT_REGISTERED)
//                }
//                    else{
//                    emailData=data
//                    console.log("emailData",emailData)
//                    cb(null)
//                }
//                }
//            })
//        },
//        function(cb){
//            const criteria={
//                email:payloadData.email
//            }
//            const dataToUpdate={
//                passwordResetToken:resetToken
//            }
//            const options={
//                lean:true,
//                new:true
//            }
//           userModel.updateUser(criteria,dataToUpdate,options,function(err,data){
//               if(err){
//                   cb(err)
//               }
//               else{
//                   passwordUpdated=data
//                   cb(null)
//               }
//           })
//        },
//        function (cb) {
//            if (emailData) {
//                const smsDetails = {
//                    user_name: emailData.first_name,
//                    password_reset_token:resetToken,
//                    password_reset_link: 'http://localhost:3001/'+ ' ' + '/passwordResetToken=' + resetToken + '&email=' + payloadData.email
//                }
//           // Email To Be Sent
//               const message="<h1> Forgot Password Link </h1> <br/><br/> Hello smsDetails.user_name, <br/> To Rest Password, please click <a href=smsDetails.password_reset_link>here</a>"
//                messenger.sendMail("chandan.sharma@click-labs.com",emailData.email,"reset link",smsDetails.password_reset_link,function(err,msg){
//                    if(err){
//                        cb(err)
//                    }
//                    else{
//                        console.log("Message",msg)
//                        cb(null)
//                    }
//                })
//            }
//            else {
//                cb("Implementation Error")
//            }
//        }],
//    function(err,data){
//        if(err){
//            callback(err)
//        }
//        else{callback(data)
//        }
//    })
//}

module.exports.getMasterServicesUsers = function(request, reply){
    console.log("in handler getMasterServices :::  ");
    userModel.getMasterServices(function(err,data){
        if(err){
               reply(err)
           }
        else{
            responseFormatter.formatServiceResponse(data,reply, 'Fetched successfully','success',200);
        }
    });
};

module.exports.getGigsHandler = function(request, reply){
    console.log("in handler getMasterServices :::  ");
    const payload=request.query
    userModel.getGigsServices(payload,function(err,data){
        if(err){
            reply(err);
        }
        else{
            responseFormatter.formatServiceResponse(data,reply, 'Fetched successfully','success',200);
        }
    });
};

module.exports.updateUserProfile = function(request, reply){
    //logger.debug('Updating user: ', request.payload);

    var payload = request.payload;
    console.log('payload updateUserProfile :::: ',payload);
    try{
        //same requester so proceed with update
        userModel.updateUserProfile(payload,
            function(response){
                if(response.status == 'success'){
                    reply(response);
                }
                else{
                    console.log('error in updateUserProfile ',response);
                    reply(response);
                }
            }
        );
    }
    catch(err){
        logger.error('In Catch Update failed', err);
        reply(Boom.badImplementation('Access denied'));
        return;
    }

};
module.exports.updateUserHandler = function(request, reply){
    //logger.debug('Updating user: ', request.payload);

    var payload = request.payload;
    console.log('payload updateUserProfile :::: ',payload);
    try{
        //same requester so proceed with update
        userModel.updateUserHandler(payload,
            function(response){
                if(response.status == 'success'){
                    reply(response);
                }
                else{
                    console.log('error in updateUserProfile ',response);
                    reply(response);
                }
            }
        );
    }
    catch(err){
        logger.error('In Catch Update failed', err);
        reply(Boom.badImplementation('Access denied'));
        return;
    }

};
module.exports.getUserProfile=function(request,reply){
   let payload=request.query
    userModel.getUserProfileModel(payload,function(err,data){
        if(err){
            reply(err)
        }
        else{
            responseFormatter.formatServiceResponse(data, reply, 'userProfile Data','Success',200);
        }
    })
}


   module.exports.forgotPasswordHandler=function (request, reply) {
    const payloadData = request.payload;
    userModel.forgotPasswordUser(payloadData, function (err,data) {
        if (err) {
            reply(err);
        } else {
            responseFormatter.formatServiceResponse(data, reply, "Reset Password Link has been sent to email" , "success",200);
        }
    });
}
module.exports.userFavourite=function(request,reply){
    let payload=request.payload
    userModel.userFavouriteModel(payload,function(err,data){
        if(err){
            reply(err)
        }
        else{
            responseFormatter.formatServiceResponse(data,reply, config.constants.messages.Success.insertion,'success',200);
        }
    })
}
module.exports.removeFavouriteService=function(request,reply){
    let payload=request.payload
    userModel.removeFavouriteService(payload,function(err,data){
        if(err){
            reply(err)
        }
        else{
            responseFormatter.formatServiceResponse(data,reply, config.constants.messages.Success.updation,'success',200);
        }
    })
}
module.exports.removeFavouriteGig=function(request,reply){
    let payload=request.payload
    userModel.removeFavouriteGig(payload,function(err,data){
        if(err){
            reply(err)
        }
        else{
            responseFormatter.formatServiceResponse(data,reply, config.constants.messages.Success.updation,'success',200);
        }
    })
}
module.exports.getUserFavourite=function(request,reply){
    let payload=request.query
   userModel.getUserFavouriteModel(payload,function(err,data){
        if(err){
            reply(err)
        }
        else{
            responseFormatter.formatServiceResponse(data,reply, config.constants.messages.Success.insertion,'success',200);
        }
    })
}
module.exports.resetPasswordUser=function(request,reply){
    const payload=request.payload
    userModel.resetPasswordUser(payload, function (err) {
        if (err) {
            reply(err);
        } else {
            responseFormatter.formatServiceResponse({}, reply, "Password reset Successfully" , "success",200);
        }
    });
}

module.exports.changePasswordUser = function(request,reply){
    const payload=request.payload
    userModel.changePasswordUser(payload, function (err) {
        if (err) {
            reply(err);
        } else {
            responseFormatter.formatServiceResponse({}, reply, "Password changed Successfully" , "success",200);
        }
    });
}

module.exports.addOrganizationData = function(request, reply){
    let user_id =  request.auth.credentials.user_id;
    userModel.addOrganizationData(request.payload ,user_id, function(err,data){
        if(err){
            reply(err)
        }
        else{
            responseFormatter.formatServiceResponse(data,reply, 'User Organization Inserted Successfully','success',200);
        }
    });
};

module.exports.addBankDetails = function(request, reply){
    userModel.addBankDetails(request.payload , function(err,data){
        if(err){
            reply(err)
        }
        else{
            responseFormatter.formatServiceResponse(data,reply, 'User Organization Bank Details Inserted Successfully','success',200);
        }
    });
};

module.exports.addInsuranceDetails = function(request, reply){
    userModel.addInsuranceDetails(request.payload , function(err,data){
        if(err){
            reply(err)
        }
        else{
            if(data){
                responseFormatter.formatServiceResponse(data,reply, 'User Organization Insurance Details Inserted Successfully','success',200);
            }else{
                responseFormatter.formatServiceResponse(data,reply, 'User Organization Profile not found','error',404);

            }
        }
    });
};


module.exports.toggleNotificationFlag = function(request,reply){
    let user_id =  request.auth.credentials.user_id;
    let role = request.auth.credentials.role;
    let payload = request.payload;
    console.log('payload  in handler toggleNotificationFlag ::: ',payload);
    userModel.toggleNotificationFlag(user_id ,role , payload, function(data){
        console.log('in handler response from toggleNotificationFlag : ',data)
        reply(data);
    });

};

module.exports.toggleBGCFlag = function(request,reply){
    let payload = request.payload;
    console.log('payload  in handler toggleBGCFlag ::: ',payload);
    userModel.toggleBGCFlag(payload, function(data){
        console.log('in handler response from toggleBGCFlag : ',data)
        reply(data);
    });

};

module.exports.getAllPromotions = function(request,reply){
    userModel.getAllPromotions(function(err,data){
        if(err){
            reply(err)
        }
        else{
            responseFormatter.formatServiceResponse(data, reply, "" , "Success",200)
        }
    })
}

module.exports.makeFavourites = function(request,reply){
    const payload=request.payload
    userModel.makeFavourites(payload, function (err) {
        if (err) {
            reply(err);
        } else {
            responseFormatter.formatServiceResponse({}, reply, "Favourites added Successfully" , "success",200);
        }
    });
}

module.exports.getFavouriteServices = function(request,reply){
    let user_id=request.query.user_id;
    userModel.getFavouriteServices(user_id,function(err,data){
        if(err){
            reply(err)
        }
        else{
            responseFormatter.formatServiceResponse(data,reply,'User Favourite services fetched successfully' ,'success',200);
        }
    })
}

module.exports.getAllFavGigsForSpecificService  = function(request,reply){
    let user_id =  request.auth.credentials.user_id;
    let service_id = request.params.service_id;
    console.log('in handler getAllFavGigsForSpecificService ::: ');
    userModel.getAllFavGigsForSpecificService(service_id , user_id ,function(response){
        reply(response);
    })

};

module.exports.setLanguageParam = function(request,reply){
    const payload=request.payload
    userModel.setLanguageParam(payload, function (err) {
        if (err) {
            reply(err);
        } else {
            responseFormatter.formatServiceResponse({}, reply, "Language added Successfully" , "success",200);
        }
    });
}

module.exports.AddOrDeductWalletAmountByUserId = function(request,reply){
    let user_id = request.payload.user_id;
    let amount = request.payload.amount;
    userModel.AddOrDeductWalletAmountByUserId(request.payload,function(err,data){
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

module.exports.getWalletCreditByUserId  = function(request,reply){
    let user_id =  request.query.user_id;
    console.log('in handler getWalletCreditByUserId ::: ');
    userModel.getWalletCreditByUserId(user_id ,function(response){
        reply(response);
    })

};