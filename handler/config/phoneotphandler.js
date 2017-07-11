/**
 * Created by cl-macmini-63 on 1/18/17.
 */
'use strict';

const phoneOtpModel = require( 'model/phoneotp.js' );

const  log = require('Utils/logger.js');
const logger = log.getLogger();

const responseFormatter = require('Utils/responseformatter');

module.exports={};


module.exports.sendOtpToPhone = function(request, reply){
    logger.debug("sendOTP  :  ",request.payload);
    let payload=request.payload
    phoneOtpModel.sendOtpToPhone(payload , function(response){
        if(response.status == 'success'){
            reply(response);
        }
            //responseFormatter.formatServiceResponse(response, reply,'OTP sent Successfully on your phone', 'success',200);
        else{
            console.log('error in sendOTP');
            reply(response);
            //responseFormatter.formatServiceResponse('', reply,'Error occured. Otp sending failed.', 'error');
        }
    });
};

module.exports.sendOtpToEmail = function(request, reply){
    logger.debug("sendOTP  :  ",request.payload.email);
    phoneOtpModel.sendOtpToEmail(request.payload.email , function(response){
        if(response)
            reply(response);
            //responseFormatter.formatServiceResponse(response, reply,'OTP sent Successfully on your Email', 'success');
        else{
            console.log('error in sendOTP');
            reply(response);
            //responseFormatter.formatServiceResponse('', reply,'Error occured. Otp sending failed.', 'error');
        }
    });
};


module.exports.verifyPhoneOTP = function(request, reply){
    logger.debug("verifyPhoneOTP  :  ",request.payload);
    let payload=request.payload
    phoneOtpModel.verifyPhoneOTP(payload, function(response){
        //if(response)
        //    responseFormatter.formatServiceResponse('', reply,'OTP verified Successfully', 'success');
        //else{
        //    console.log('error in veriyOTP');
        //    responseFormatter.formatServiceResponse('', reply,'Error occured. Otp verification failed.', 'error');
        //}
        reply(response);
    });
};

module.exports.verifyEmailOTP = function(request, reply){
    logger.debug("verifyEmailOTP  :  ",request.payload);
    phoneOtpModel.verifyEmailOTP(request.payload , function(response){
        reply(response);
        /*if(response)
            responseFormatter.formatServiceResponse('', reply,'Email verified Successfully', 'success');
        else{
            console.log('error in veriyOTP');
            responseFormatter.formatServiceResponse('', reply,'Error occured. Otp verification failed.', 'error');
        }*/
    });
};

