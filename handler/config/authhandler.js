/**
 * Created by cl-macmini-63 on 1/16/17.
 */
'use strict';
const authModel = require( 'model/auth.js' );

const Boom = require('boom');

const  log = require('Utils/logger.js');
const logger = log.getLogger();
let userSchema = require('schema/mongo/userschema');
let bookingSchema = require('schema/mongo/bookingschema');
const userModel = require( 'model/user.js' );
const responseFormatter = require('Utils/responseformatter');
const SPProfileSchema = require('schema/mongo/SPprofile');
const adminGlobalDataSchema = require('schema/mongo/adminglobaldata');

module.exports={};

/**
 * Handler for authentication request
 */
'use strict';
module.exports.authenticateUser = function(request, reply){
    var payload = request.payload;
    console.log('in auth handler authenticateUser : ',payload);
    authModel.authenticateUser (payload , payload.email, payload.password, payload.current_role,payload.fb_id,function(response){
        console.log('Authentication response: *******', response);
        reply(response);
        /*if (response.status == 'error'){
            if (response.error_type = 'AuthenticationError'){
                reply(Boom.unauthorized(response.message));
            }
            else{
                reply(response);
                //reply(Boom.badImplementation('Unable to authentication user: ' + response.message));
            }
        }
        else{
            console.log("In Auth Controller authenticateUser :",response);
            reply(response);
        }*/


    });
}
module.exports.accessTokenLogin=function(request,reply){
    console.log("authtoken", request.headers.authorization);
    var payload = request.query;
    var dataToken=null;
    var retData = {};
    var authToken = request.headers.authorization;

    var current_role = request.auth.credentials.role;
    const criteria={
        user_id:request.auth.credentials.user_id
    };
    const options={
        lean:true
    };

    // create auth token again here , because in case of switch profile deviceToken is new here whereas this auth token is containing token for previous role.
    const tokenTime = new Date().getTime();
    authModel.createAuthToken(criteria.user_id, current_role, payload.device_token, tokenTime, authModel.privateKey,
        function (token) {
            if (token == null || token == undefined) {
                console.log("in accessTokenLogin Auth token could not be created ");
                responseFormatter.formatServiceResponse(new Error('Error while creating auth-token'), callback);
            } else {
                authToken = token;
                userSchema.User.findOne(criteria,{},options,function(err,data){
                    console.log("in access token function user data found by criteria --- > ",data);
                    if(err){
                        reply(err)
                    }
                    else{
                        userSchema.User.update(criteria, { $addToSet: { role:  current_role } } , function(err , response) {
                            console.log('err : ', err, "  role added in access token login ---> response :: ", response);
                            if (err) {
                                logger.error("Update failed in switchProfile :", err);
                                return responseFormatter.formatServiceResponse(err, callback);
                            } else {
                                var userDataToUpdate = {
                                    'email'         : data.email,
                                    'app_version'   : payload.app_version,
                                    'device_token'  : payload.device_token,
                                    'device_type'   : payload.device_type,
                                    'time_zone'     : payload.time_zone,
                                    'tokenTime'     : tokenTime,
                                    'roleTokenObject'   :{
                                        'role'  : current_role,
                                        'token' : payload.device_token,
                                        'token_time': tokenTime
                                    }
                                };
                                console.log('userDataToUpdate ::: ',userDataToUpdate);
                                userModel.updateUserData(userDataToUpdate , function(result){
                                    console.log('in function access token login --> result from updateUserData ',result);
                                    if(result.statusCode == 200){
                                        if(current_role=='PROVIDER'){
                                            bookingSchema.Booking.find({provider_id:request.auth.credentials.user_id,pre_on_the_way:true},{},{lean:true},function(err,booking){
                                                if(err)
                                                {
                                                    reply(err)
                                                }
                                                else{
                                                    SPProfileSchema.SPProfile.findOne({provider_id:request.auth.credentials.user_id},{mode_of_transport:1,is_available:1,i_can_travel:1,is_approved:1,discount:1},{lean:true},function(err,provider){
                                                        if(err){
                                                            reply(err)
                                                        }
                                                        else{
                                                            console.log("provider data",provider);
                                                            adminGlobalDataSchema.AdminGlobalData.findOne({}, {filter_radius:1}, {lean: true}, function (err, adminGolbalData) {
                                                                console.log("in authhandler accessTokenLogin adminGolbalData err ",err,"  data : ",adminGolbalData);
                                                                if (err) {
                                                                    console.log('error in addGlobalData :: ', err);
                                                                    responseFormatter.formatServiceResponse(err, callback);
                                                                }
                                                                else {
                                                                    let maxDistance =  adminGolbalData.filter_radius ? Number(adminGolbalData.filter_radius)*1000 : 50000;
                                                                    if(provider){
                                                                        dataToken=data;
                                                                        dataToken.mode_of_transport=provider.mode_of_transport;
                                                                        dataToken.is_available = provider.is_available;
                                                                        dataToken.i_can_travel = provider.i_can_travel;
                                                                        dataToken.is_approved = provider.is_approved;
                                                                        dataToken.discount = provider.discount;
                                                                        dataToken.max_distance = maxDistance;
                                                                        dataToken.max_time = 7200;
                                                                        authToken = authToken.replace(/Bearer/gi, '').replace(/ /g, '')
                                                                        retData.user = dataToken;
                                                                        retData.booking=booking;
                                                                        retData.authToken = authToken;
                                                                        console.log("retData in authentication mode_of_transport",retData)
                                                                        responseFormatter.formatServiceResponse(retData,reply,'User Logged in successfully with access token','success',200 );
                                                                    }
                                                                    else{
                                                                        dataToken=data;
                                                                        dataToken.max_distance = maxDistance;
                                                                        dataToken.max_time = 7200;
                                                                        dataToken.is_approved = false;
                                                                        authToken = authToken.replace(/Bearer/gi, '').replace(/ /g, '')
                                                                        retData.user = dataToken;
                                                                        retData.booking=booking;
                                                                        retData.authToken = authToken;
                                                                        console.log("retData in authentication booking",retData)
                                                                        responseFormatter.formatServiceResponse(retData,reply,'User Logged in successfully with access token','success',200 );
                                                                    }
                                                                }
                                                            });


                                                        }
                                                    })

                                                }  //reply(dataToken)}
                                            })
                                        }
                                        else{
                                            dataToken=data;
                                            authToken = authToken.replace(/Bearer/gi, '').replace(/ /g, '')
                                            retData.user = dataToken;
                                            retData.authToken = authToken;
                                            responseFormatter.formatServiceResponse(retData,reply,'User Logged in successfully with access token','success',200 );
                                        }
                                    }else{
                                        console.log("*********response from updateUser  ::",result);
                                        return responseFormatter.formatServiceResponse({}, reply , 'Failed to update user data.Please try to login again', 'error',400);
                                    }
                                });
                            }
                        });
                    }
                });
            }
    })
}

module.exports.signout=function(request,reply){
    console.log("authtoken", request.headers.authorization);
    var authToken = request.headers.authorization;
    var user_id = request.auth.credentials.user_id;
    var role = request.auth.credentials.role;
    authModel.signout(authToken , user_id , role , function(response){
        console.log('in authhandler response from auth js : ',response);
        reply(response);
    })
}

module.exports.switchProfile=function(request,reply){
    console.log("authtoken", request.headers.authorization);
    console.log("request.auth", request.auth);
    const payload = {
        user_id : request.auth.credentials.user_id,
        role : request.auth.credentials.role,
        device_token : request.auth.credentials.device_token
    }
    authModel.switchProfile(payload , function(response){
        console.log('in authhandler switchProfile response from auth js : ',response);
        reply(response);
    })
    
    
    //reply(request);
    /*var dataToken=null;
    var retData = {};
    var authToken = request.headers.authorization;
    const criteria={
        user_id:request.auth.credentials.user_id
    }
    const options={
        lean:true
    }
    userSchema.User.findOne(criteria,{},options,function(err,data){
        if(err){
            reply(err)
        }
        else{
            console.log("data",data)
            dataToken=data;
            authToken = authToken.replace(/Bearer/gi, '').replace(/ /g, '')
            retData.user = dataToken;
            retData.authToken = authToken;
            responseFormatter.formatServiceResponse(retData,reply,'User Logged in successfully with access token','success',200 );
            //reply(dataToken)
        }
    })*/
}

