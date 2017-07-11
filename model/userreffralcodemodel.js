/**
 * Created by clicklabs on 6/22/17.
 */

'use strict';
const responseFormatter = require('Utils/responseformatter.js');
const userReffralCodeSchema = require('schema/mongo/userreffralcode.js');
const adminReffralbenefitsSchema = require('schema/mongo/adminreffbenefits.js');
const userSchema = require('schema/mongo/userschema');
const  log = require('Utils/logger.js');
var config=require('../config');
const logger = log.getLogger();


module.exports.createReffralCode = function (payload, callback) {


    userReffralCodeSchema.UserReffralCode.findOne({user_id : payload.user_id}, {}, {lean: true}, function (err, reff_code_data) {
        if (err) {
            callback(err)
        }
        else {
            if(reff_code_data){
                console.log("Reff code already present for this user reff_code_data ", reff_code_data);
                callback(null , reff_code_data);
            }else{

                let reffralCode = Math.random().toString(36).substr(2, 6);
                payload.reff_code = reffralCode;

                let reffralCodeInfo = new userReffralCodeSchema.UserReffralCode(payload);
                reffralCodeInfo.save(function (err, savedReffralCode) {
                    if (err) {
                        callback(err);
                    }
                    else {
                        console.log("reffralCodeInfo savedData______", savedReffralCode);
                        callback(null , savedReffralCode);
                    }
                })
            }
        }
    })
}


function providerBenefits(referee_id ,referrer_id, role , callback) {
    let payload = '';
    if(role == 'SEEKER'){
        payload = {
            "seeker_benifits_for_referrer" : {
                "seeker_id" : referrer_id,
                "benefits"	: 50
            },
            "seeker_benifits_for_referee" : {
                "seeker_id" : referee_id,
                "benefits"	: 40
            }
        }
    }
    if(role == 'PROVIDER'){
        payload = {
            "provider_benifits_for_referrer" : {
                "provider_id" : referrer_id,
                "benefits"	: 50
            },
            "provider_benifits_for_referee" : {
                "provider_id" : referee_id,
                "benefits"	: 40
            }
        }
    }
    let adminReffBenefit = new adminReffralbenefitsSchema.AdminRefferalbenefit(payload);
    console.log('adminReffBenefit ** ',adminReffBenefit);
    adminReffBenefit.save(function (err, adminReffBenefit) {
        if (err) {
            callback({"status":"error", "data":err});
        }
        else {
            console.log("reffralCode savedData______", adminReffBenefit);
            callback({"status":"success", "data":adminReffBenefit});
        }
    })
}

var updateUserByReffCode = function (user_id, reff_code, role, callback) {

    let payload = {
        'reff_code'   : {
            'code'    : reff_code,
            'used_by' : [role]
        },
    }

    userSchema.User.findOneAndUpdate({user_id : user_id},
        {$set : {'reff_code.code':reff_code},$addToSet :{'reff_code.used_by':role}} ,{new:true},function(err,data){
        if(err){
            callback({"status":"error", "data":err});
        }
        else{
            console.log("in updateUserByReffCode data------------",data);
            if(data){
                //responseFormatter.formatServiceResponse(data, callback, 'User Language status changed successfully', 'success', 200);
                callback({"status":"success", "data":data});
            }else{
                callback({"status":"success", "data":data});
                //responseFormatter.formatServiceResponse({}, callback, 'User Profile not found. Please create your profile first.', 'error', 404);

            }

        }
    })

}

module.exports.applyReffralCode = function (payload,current_role, callback) {

    let reffralCode = payload.reff_code;

    userReffralCodeSchema.UserReffralCode.findOne({reff_code : reffralCode}, {}, {lean: true}, function (err, reff_code_data) {
        if (err) {
            callback(err)
        }
        else {
            if (!reff_code_data || reff_code_data.length == 0) {
                callback(null , {"message": "Refferal Code not valid","status":"error"});
            }
            else {
                console.log("--------***Reff code Valid Data", reff_code_data);

                // Now check if this code is already used by him
                userSchema.User.findOne({user_id: payload.user_id , 'reff_code.code' : reffralCode},{reff_code:1}, function (err, user) {
                    console.log('User returned', user);
                    if (err){
                        logger.error("Find failed", err);
                        callback(err)
                        //responseFormatter.formatServiceResponse(err, callback);
                    }
                    else {
                        if(!user || user.length == 0){

                            // Valid Reffral code , can be applied - give benifits
                            providerBenefits(payload.user_id,reff_code_data.user_id, current_role , function(result){
                               if(result.status == 'error'){
                                   callback(result.data);
                               } else{
                                   updateUserByReffCode(payload.user_id ,reffralCode ,current_role , function(updateResponse){
                                       if(result.status == 'error'){
                                           callback(result.data);
                                       }
                                       else{
                                           callback(null , result.data);
                                       }
                                   })
                               }
                            });

                        }else{
                            if(user.reff_code && user.reff_code.used_by &&
                                user.reff_code.used_by.length!=0 &&
                                user.reff_code.used_by.indexOf(current_role) == -1 ){

                                // Valid Reffral code , can be applied - give benifits

                                providerBenefits(payload.user_id ,reff_code_data.user_id, current_role , function(result){
                                    if(result.status == 'error'){
                                        callback(result.data)
                                    } else{
                                        updateUserByReffCode(payload.user_id ,reffralCode ,current_role , function(updateResponse){
                                            if(result.status == 'error'){
                                                callback(result.data);
                                            }
                                            else{
                                                callback(null , result.data);
                                            }
                                        })
                                    }
                                });

                            }else{
                                callback(null , {"message": "Refferal Code Already used!","status":"error"});
                            }
                        }

                    }
                });

            }
        }
    })
}


