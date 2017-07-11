/**
 * Created by cl-macmini-63 on 1/18/17.
 */
'use strict';
const responseFormatter = require('Utils/responseformatter.js');
const phoneOtpSchema = require('schema/mongo/phoneotp');
const  log = require('Utils/logger.js');
const logger = log.getLogger();
const messenger = require('Utils/messenger.js');
const commonFunctions = require('Utils/commonfunction.js');
const config=require('../config')
let async=require('async')
const userSchema = require('schema/mongo/userschema');

module.exports = {};


module.exports.sendOtpToPhone = function(payload, callback){
    console.log("send OTP service : phone ",payload);

    var otp = 4444;
        //commonFunctions.generateRandomString();
    console.log('OTP  generated :: ',otp);
    var phoneotpRecord = new phoneOtpSchema.PhoneOtp(payload);
    phoneotpRecord.otp = otp;
    console.log('phoneotpRecord :: ',phoneotpRecord);
    async.series([
            function(cb){
                userSchema.User.findOne({mobile:phoneotpRecord.phone,countryCode:phoneotpRecord.countryCode},function(err,data){
                    if(err){
                        cb(err)
                    }
                    else{
                        if(data){
                            responseFormatter.formatServiceResponse({}, cb, 'Phone Number Already Registered','error',400);
                        }
                        else{
                            cb(null)
                        }
                    }
                })
            },
        function(cb){
            const options={
            lean:true
        }
            phoneOtpSchema.PhoneOtp.find({phone:phoneotpRecord.phone,countryCode:phoneotpRecord.countryCode,is_verified:true},options,function(err,data){
            if(err){
                cb(err)
            }
            else{
                console.log("condition",data)
                if(data && data.length==0){
                    cb(null)
                }
                else{
                    responseFormatter.formatServiceResponse({}, cb, 'Phone Number Already Verified','error',405);
                }
            }
        })
    },
        function(cb){
        phoneOtpSchema.PhoneOtp.find({phone:phoneotpRecord.phone,countryCode:phoneotpRecord.countryCode,is_verified:false},{lean:true},function(err,data){
            if(err){
                cb(err)
            }
            else{
                console.log("condition",data)
                if(data && data.length==0){
                    phoneotpRecord.save(function(err,phoneotpRecord){
                        if (err){
                            responseFormatter.formatServiceResponse(err, cb);
                        }
                        else {
                            console.log("in success :phoneotpRecord created successfully",phoneotpRecord);
                            messenger.sendSMSToUser('OTP_SMS',phoneotpRecord.otp,phoneotpRecord.countryCode,phoneotpRecord.phone,function(err){
                                if(err){
                                    cb(err)
                                }
                                else{
                                    responseFormatter.formatServiceResponse({"otp" : otp}, cb, 'OTP sent successfully','success',200);
                                }
                            });

                        }
                    });
                }
                else{
                    phoneOtpSchema.PhoneOtp.findOneAndUpdate({phone:phoneotpRecord.phone,countryCode:phoneotpRecord.countryCode,is_verified:false},{otp:phoneotpRecord.otp},{new:true},
                    function(err,data){
                        if (err){
                            responseFormatter.formatServiceResponse(err, cb);
                        }
                        else {
                            console.log("data After updating OTP",data);
                            messenger.sendSMSToUser('OTP_SMS',phoneotpRecord.otp,data.countryCode,data.phone,function(err){
                                if(err){
                                    cb(err)
                                }
                                else{
                                    responseFormatter.formatServiceResponse({"otp" : otp}, cb, 'OTP sent successfully','success',200);
                                }
                            });

                        }
                    })
                }
            }
        })

    }
    ],
    function(err,data){
        if(err){
            callback(err)
        }
        else{
            callback(data)
        }
    })




};

module.exports.sendOtpToEmail = function(email , callback){
    console.log("send OTP service : email ",email);

    var otp = 4444;
        //commonFunctions.generateRandomString();
    console.log('OTP  generated :: ',otp);
    var phoneotpRecord = new phoneOtpSchema.PhoneOtp();
    phoneotpRecord.email = email;
    phoneotpRecord.otp = otp;
    console.log('phoneotpRecord :: ',phoneotpRecord);
    async.series([
        function(cb){
            userSchema.User.findOne({email:phoneotpRecord.email},function(err,data){
                if(err){
                    cb(err)
                }
                else{
                    if(data){
                        responseFormatter.formatServiceResponse({}, cb, 'Email Already Registered','error',400);
                    }
                    else{
                    cb()
                    }
                }
            })
    },
        function(cb){
            phoneOtpSchema.PhoneOtp.find({email:phoneotpRecord.email,is_verified:true},{lean:true},function(err,data){
                if(err){
                    cb(err)
                }
                else{
                    console.log("condition",data)
                    if(data && data.length==0){
                        cb(null)
                    }
                    else{
                        responseFormatter.formatServiceResponse({}, cb, 'Email Already Verified','error',405);
                    }
                }
            })
        },
        function(cb){
            phoneOtpSchema.PhoneOtp.find({email:phoneotpRecord.email,is_verified:false},{lean:true},function(err,data){
                if(err){
                    cb(err)
                }
                else{
                    console.log("condition",data)
                    if(data && data.length==0){
                        phoneotpRecord.save(function(err,phoneotpRecord){
                            if (err){
                                responseFormatter.formatServiceResponse(err, cb);
                            }
                            else {
                                console.log("in success :phoneotpRecord created successfully",phoneotpRecord);

                                const message="<h1> Welcome To Futran </h1><br/> Your OTP is"+ phoneotpRecord.otp
                                messenger.sendEmailToUser('SEND_OTP',message,phoneotpRecord.email,function(err,msg){
                                    if(err){
                                        cb(err)
                                    }
                                    else{
                                        console.log("MSG",msg)
                                        responseFormatter.formatServiceResponse({"otp" : otp}, cb, 'OTP sent successfully','success',200);
                                    }
                                });

                            }
                        });
                    }
                    else{
                        phoneOtpSchema.PhoneOtp.findOneAndUpdate({email:phoneotpRecord.email,is_verified:false},{otp:phoneotpRecord.otp},{new:true},
                            function(err,data){
                                if (err){
                                    responseFormatter.formatServiceResponse(err, cb);
                                }
                                else {
                                    console.log("in success :phoneotpRecord created successfully",phoneotpRecord);

                                    const message="<h1> Welcome To Futran </h1><br/> Your OTP is"+ phoneotpRecord.otp
                                    messenger.sendEmailToUser('SEND_OTP',message,phoneotpRecord.email,function(err,msg){
                                        if(err){
                                            cb(err)
                                        }
                                        else{
                                            console.log("MSG",msg)
                                            responseFormatter.formatServiceResponse({"otp" : otp}, cb, 'OTP sent successfully','success',200);
                                        }
                                    });

                                }
                            })
                    }
                }
            }) 
        }
    ],function(err,data){
        if(err){
            callback(err)
        }
        else{
            callback(data)
        }
    })
};


module.exports.verifyPhoneOTP = function(payload , callback){
    console.log("verifyOTP OTP service : payload ",payload);
   async.series([
       function(cb){
           const criteria={
           countryCode:payload.countryCode,
           phone:payload.phone,
           is_verified:true
       }
       const options={
           lean:true
       }
           phoneOtpSchema.PhoneOtp.find(criteria,{},options,function(err,data){
               if(err){
                   cb(err)
               }
               else{
                   if(data && data.length==0){
                       cb(null)
                   }
                   else{
                       responseFormatter.formatServiceResponse({}, cb, 'Phone Number Already Verified','error',400);
                   }

               }
           })
   },
   function(cb){
       //payload.otp
       phoneOtpSchema.PhoneOtp.findOneAndUpdate({'phone':payload.phone , 'otp' :payload.otp,countryCode:payload.countryCode}, {$set:{'is_verified' :1,'otp':0}}, {new: true}, function(err, verifiedRecord){
           console.log("verifiedRecord   : ",verifiedRecord);
           if(err){
               console.log("Something wrong when updating data!",err);
               responseFormatter.formatServiceResponse(err, callback);
           }
           else{
               if(verifiedRecord){
                   responseFormatter.formatServiceResponse(verifiedRecord, cb, 'OTP verified successfully','success',200);
                   //callback(true);
               }else{
                   responseFormatter.formatServiceResponse({}, cb, 'OTP not Verified','error',400);
                   //callback();
               }
           }
       });
   }
   ],function(err,data){
       if(err){
           callback(err)
       }
       else{
           callback(data)
       }
   })

};

module.exports.verifyEmailOTP = function(payload , callback){
    console.log("verifyOTP OTP service : payload ",payload);
// payload.otp
    phoneOtpSchema.PhoneOtp.findOneAndUpdate({'email':payload.email , 'otp' :payload.otp}, {$set:{'is_verified' :true}}, {new: true}, function(err, verifiedRecord){
        console.log("verifiedRecord   : ",verifiedRecord);
        if(err){
            console.log("Something wrong when updating data!",err);
            responseFormatter.formatServiceResponse(err, callback);
        }
        else{
            if(verifiedRecord){
                responseFormatter.formatServiceResponse({}, callback, 'OTP verified successfully','success',200);
            }else{
                responseFormatter.formatServiceResponse({}, callback, 'OTP not Verified','error',400);
            }
        }
    });
};


module.exports.is_phone_verified = function(phone ,email , callback){
    console.log("is_phone_verified  service  ",phone);

    phoneOtpSchema.PhoneOtp.findOne({'phone':phone , 'is_verified' : true}, function (err, verifiedRecord) {
        console.log('verifiedRecord for phone returned', verifiedRecord);
        if (err){
            logger.error("Find failed", err);
            return callback();
            //responseFormatter.formatServiceResponse(err, callback);
        }
        else {
            if(verifiedRecord){
                phoneOtpSchema.PhoneOtp.findOne({'email':email , 'is_verified' : true}, function (err, verifiedRecord) {
                    console.log('verifiedRecord for email returned', verifiedRecord);
                    if (err){
                        logger.error("Find failed", err);
                        return callback();
                        //responseFormatter.formatServiceResponse({}, callback, 'Email not Verified','error',400);
                        //responseFormatter.formatServiceResponse(err, callback);
                    }
                    else{
                        if(verifiedRecord){
                            return callback(true);
                        }else{
                            callback();
                            //return responseFormatter.formatServiceResponse({}, callback, 'Phone verification failed','error',400);
                        }
                    }
                });
            }else{
                callback();
            }
        }
    });
};
