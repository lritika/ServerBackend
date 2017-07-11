/**
 * Created by cl-macmini-63 on 1/16/17.
 */

/**
 * Created by prashant on 7/1/17.
 */
'use strict';

//create logger
var log = require('Utils/logger.js');
var logger = log.getLogger();

const userModel = require( 'model/user.js' );

//auth token module
var jwt = require('jsonwebtoken');

//custom modules
//response formatter
var responseFormatter = require('Utils/responseformatter.js');

var storageService = require('model/storageservice.js');

var privateKey = '_1.2v^:69F61n151EodW+!925;-Cx-;m.*Z2=^y463B+9Z.49^%7I%3b62%z%;+I';
var userSchema=require('schema/mongo/userschema.js');
const SPProfileSchema = require('schema/mongo/SPprofile');
const adminGlobalDataSchema = require('schema/mongo/adminglobaldata');

module.exports={};

module.exports.privateKey = privateKey;

var decodeToken = function(token, callback){
    //check if token is valid
    var options={}
    jwt.verify(token, privateKey, options, callback);
}

module.exports.decodeToken = decodeToken;


module.exports.createAuthToken = function(user_id, role, deviceToken , currentTime, privateKey, callback){
    console.log('Creating auth token from - user_id: ',user_id,"  role : ",role,"  deviceToken :: ",deviceToken, "currentTime ::",currentTime);
    var authToken = jwt.sign({user_id: user_id , role: role, device_token: deviceToken , tokenTime : currentTime }, privateKey);
    console.log("in createAuthToken () -  auth Token :",authToken);
    if(authToken == null || authToken == undefined){
        callback();
    }
    else{
        callback(authToken);
    }
}


module.exports.authenticateUser = function(payload ,userid, password, current_role,fb_id , callback){
    logger.debug('AuthService authentication...');
    if(payload.email){
        payload.email = payload.email.toLowerCase();
    }
    var self = this;
    var authToken;
    const userModel = require( 'model/user.js' );


    if(payload.fb_id){
        userSchema.User.findOne({$or:[ {'email': payload.email},{'fb_id' :payload.fb_id} ]},{},{lean:true}, function (err, user) {
            console.log('User returned from fb id/email : ', user);
            if (err){
                logger.error("Find failed", err);
                return responseFormatter.formatServiceResponse(err, callback);
            }
            else {
                console.log("user After Fb_______",user);
                if(user){
                    if (user.role.indexOf(current_role) == -1) {
                        return responseFormatter.formatServiceResponse({}, callback, "role not valid", "error",401);
                    }

                    const tokenTime = new Date().getTime();

                    self.createAuthToken(user.user_id, payload.current_role, payload.device_token, tokenTime, privateKey, function (token) {
                        if (token == null || token == undefined) {
                            console.log("Auth token could not be created ");
                            responseFormatter.formatServiceResponse(new Error('Error while creating auth-token'), callback);
                        } else {
                            authToken = token;
                        }
                        storageService.store(authToken, user.email, function (storageResponse) {
                            if (storageResponse.status == 'error') {
                                callback(storageResponse);
                            }
                            else if (storageResponse.status == 'success') {

                                userSchema.User.update({ user_id : user.user_id}, { $addToSet: { role:  current_role } } , function(err , data){
                                    console.log('err : ',err,"  data :: ",data);
                                    if(err){
                                        logger.error("Update failed in switchProfile :", err);
                                        return responseFormatter.formatServiceResponse(err, callback);
                                    } else{
                                        var userDataToUpdate = {
                                            'email'             : payload.email,
                                            'fb_id'             : payload.fb_id,
                                            'app_version'       : payload.app_version,
                                            'device_token'      : payload.device_token,
                                            'device_type'       : payload.device_type,
                                            'tokenTime'         : tokenTime,
                                            'roleTokenObject'   :{
                                                'role'     : current_role,
                                                'token'    : payload.device_token,
                                                'token_time': tokenTime
                                            }
                                        };
                                        if(payload.device_type){
                                            userDataToUpdate.device_type = payload.device_type;
                                        }
                                        if(payload.time_zone){
                                            userDataToUpdate.time_zone = payload.time_zone;
                                        }
                                        console.log('userDataToUpdate ::: ',userDataToUpdate);
                                        userModel.updateUserData(userDataToUpdate , function(result){
                                            if(result.statusCode == 200){

                                                SPProfileSchema.SPProfile.findOne({provider_id:user.user_id},{mode_of_transport:1,is_available:1 , i_can_travel:1, is_approved:1,discount:1},{lean:true},function(err,provider){
                                                    if(err){
                                                        reply(err)
                                                    }
                                                    else{
                                                        var dataToken;
                                                        var retData = {};
                                                        console.log("in auth.js authenticateUser login by fb provider data",provider);
                                                        adminGlobalDataSchema.AdminGlobalData.findOne({}, {filter_radius:1}, {lean: true}, function (err, adminGolbalData) {
                                                            console.log("in auth.js authenticateUser login by fb adminGolbalData err",err,"  data : ",adminGolbalData);
                                                            if (err) {
                                                                console.log('error in addGlobalData :: ', err);
                                                                responseFormatter.formatServiceResponse(err, callback);
                                                            }
                                                            else {
                                                                let maxDistance =  adminGolbalData.filter_radius ? Number(adminGolbalData.filter_radius)*1000 : 50000;
                                                                if(provider){
                                                                    dataToken=user;
                                                                    dataToken.mode_of_transport=provider.mode_of_transport;
                                                                    dataToken.is_available = provider.is_available;
                                                                    dataToken.i_can_travel = provider.i_can_travel;
                                                                    dataToken.discount = provider.discount;
                                                                    dataToken.max_distance = maxDistance;
                                                                    dataToken.max_time = 7200;
                                                                    dataToken.is_approved = provider.is_approved;
                                                                    retData.user = dataToken;
                                                                    retData.authToken = authToken;
                                                                    console.log("*********retData in authenticateUser login by fb if provider profile found  ::",retData);
                                                                    return responseFormatter.formatServiceResponse(retData, callback , 'User logged in Successfully', 'success',200);

                                                                }
                                                                else{
                                                                    dataToken=user;
                                                                    dataToken.max_distance = maxDistance;
                                                                    dataToken.max_time = 7200;
                                                                    dataToken.is_approved = false;
                                                                    retData.user = dataToken;
                                                                    retData.authToken = authToken;
                                                                    console.log("*********retData in authenticateUser login by fb if provider profile not found  ::",retData);
                                                                    return responseFormatter.formatServiceResponse(retData, callback , 'User logged in Successfully', 'success',200);
                                                                }
                                                            }
                                                        })
                                                    }
                                                })

                                            }else{
                                                console.log("*********response from updateUser  ::",result);
                                                return responseFormatter.formatServiceResponse({}, callback , 'Failed to update user data.Please try to login again', 'error',400);
                                            }
                                        });

                                    }
                                });
                            }
                            else {
                                responseFormatter.formatServiceResponse(new Error('Unidentified response'), callback , 'internal server error', 400);
                            }
                        });
                    });
                }else{
                    return responseFormatter.formatServiceResponse({}, callback, 'User not Found. Please sign up for FB !', 'error',402);

                }
            }
        });
    }
    else{
        if(payload.password)
        {
            userModel.checkPassword(payload.email, payload.password, function(response){
            console.log('response **** ',response);
                if (response.status == 'success') {
                // check if role is valid
                if (response.data.role.indexOf(payload.current_role) == -1) {
                    return responseFormatter.formatServiceResponse({}, callback, "role not valid", "error",401);
                }
                else {
                    console.log("Login Via Email Data",response.data)
                    const tokenTime = new Date().getTime();
                    //if successful add token
                    self.createAuthToken(response.data.user_id, payload.current_role,payload.device_token , tokenTime , privateKey, function (token) {
                        if (token == null || token == undefined) {
                            console.log("Auth token could not be created ");
                            responseFormatter.formatServiceResponse(new Error('Error while creating auth-token'), callback);
                        } else {
                            authToken = token;
                        }
                        storageService.store(authToken, response.data.user_id, function (storageResponse) {
                            if (storageResponse.status == 'error') {
                                callback(storageResponse);
                            }
                            else if (storageResponse.status == 'success') {
                                userSchema.User.update({ user_id : response.data.user_id}, { $addToSet: { role:  current_role } } , function(err , data){
                                    console.log('err : ',err,"  data :: ",data);
                                    if(err){
                                        logger.error("Update failed to add role while login :", err);
                                        return responseFormatter.formatServiceResponse(err, callback);
                                    } else{
                                         var userDataToUpdate = {
                                             'email'         : payload.email,
                                             'app_version'   : payload.app_version,
                                             'device_token'  : payload.device_token,
                                             'tokenTime'     : tokenTime,
                                             'roleTokenObject'   :{
                                                 'role'     : current_role,
                                                 'token'    : payload.device_token,
                                                 'token_time': tokenTime
                                             }
                                         };
                                         if(payload.device_type){
                                            userDataToUpdate.device_type = payload.device_type;
                                         }
                                         if(payload.time_zone){
                                            userDataToUpdate.time_zone = payload.time_zone;
                                         }
                                         console.log('userDataToUpdate ::: ',userDataToUpdate);
                                         userModel.updateUserData(userDataToUpdate , function(result){
                                             if(result.statusCode == 200){

                                                 SPProfileSchema.SPProfile.findOne({provider_id:response.data.user_id},{mode_of_transport:1,is_available:1 ,i_can_travel:1, is_approved:1,discount:1},{lean:true},function(err,provider){
                                                     if(err){
                                                         reply(err)
                                                     }
                                                     else{
                                                         var dataToken;
                                                         var retData = {};
                                                         console.log("in auth.js authenticateUser login by email/password provider data",provider);
                                                         adminGlobalDataSchema.AdminGlobalData.findOne({}, {filter_radius:1}, {lean: true}, function (err, adminGolbalData) {
                                                             console.log("in auth.js authenticateUser login by email/password adminGolbalData err",err,"  data : ",adminGolbalData);
                                                             if (err) {
                                                                 console.log('error in addGlobalData :: ', err);
                                                                 responseFormatter.formatServiceResponse(err, callback);
                                                             }
                                                             else {
                                                                 let maxDistance =  adminGolbalData.filter_radius ? Number(adminGolbalData.filter_radius)*1000 : 50000;
                                                                 if(provider){
                                                                     dataToken=response.data;
                                                                     dataToken.mode_of_transport=provider.mode_of_transport;
                                                                     dataToken.is_available = provider.is_available;
                                                                     dataToken.i_can_travel = provider.i_can_travel;
                                                                     dataToken.is_approved = provider.is_approved;
                                                                     dataToken.discount = provider.discount;
                                                                     dataToken.max_distance = maxDistance;
                                                                     dataToken.max_time = 7200;
                                                                     retData.user = dataToken;
                                                                     retData.authToken = authToken;
                                                                     console.log("*********retData in authenticateUser login by email/password if provider profile found  ::",retData);
                                                                     return responseFormatter.formatServiceResponse(retData, callback , 'User logged in Successfully', 'success',200);

                                                                 }
                                                                 else{
                                                                     dataToken=response.data;
                                                                     dataToken.max_distance = maxDistance;
                                                                     dataToken.max_time = 7200;
                                                                     dataToken.is_approved = false;
                                                                     retData.user = dataToken;
                                                                     retData.authToken = authToken;
                                                                     console.log("*********retData in authenticateUser login by email/password if provider profile not found  ::",retData);
                                                                     return responseFormatter.formatServiceResponse(retData, callback , 'User logged in Successfully', 'success',200);
                                                                 }
                                                             }
                                                         });
                                                     }
                                                 })
                                         }else{
                                            console.log("*********response from updateUser  ::",result);
                                            return responseFormatter.formatServiceResponse({}, callback , 'Failed to update user data.Please try to login again', 'error',400);
                                            }
                                         });
                                    }
                                });

                            }
                            else {
                                responseFormatter.formatServiceResponse(new Error('Unidentified response'), callback ,'internal server error', 400);
                            }
                        });
                    });
                }
            }
            else{
                //send error straight through
                callback(response);
            }
        });
        }
        else{
            return responseFormatter.formatServiceResponse({}, callback, 'Password is required here', 'error',400);
        }

    }
}

module.exports.signout = function(authToken, user_id, role , callback){
    logger.debug('AuthService Signout...');
    storageService.remove(authToken, function(storageResponse){
        if (storageResponse.status=='error'){
            logger.error('Error removing token', storageResponse)
            callback(storageResponsoe);
        }
        else if (storageResponse.status == 'success'){
            // temporary fix , as redis setup is not working fine. We just have to remove token from redis storage. Now we are removing device token from user document.
            userModel.signoutUser1(user_id, role , function(err , result){
                console.log('in auth js rsponse from signoutUser : ',err ,result);
                if(err){
                    return responseFormatter.formatServiceResponse(err, callback);
                }else{
                    if(result == true){
                        var retData = {'signout': true}
                        responseFormatter.formatServiceResponse(retData, callback , 'User signout successfully','success','200');
                    }else{
                        var retData = {'signout': false}
                        responseFormatter.formatServiceResponse(retData, callback , 'Signout failed. Try again','error','500');
                    }
                }
                
            });
            
        }
        else{
            responseFormatter.formatServiceResponse(new Error('Unidentified response'), callback);
        }
    });
}

module.exports.switchProfile = function(payload , callback){
    console.log('in authjs switchProfile payload  :',payload);
    var role = '';
    var self = this;
    var roleTokenArray = [];
    var roleTokenPresent = false;
    if(payload.role == 'SEEKER'){
        role = 'PROVIDER'
    }else{
        role = 'SEEKER'
    }

    const tokenTime = new Date().getTime();
    self.createAuthToken(payload.user_id, role, payload.device_token , tokenTime, privateKey, function (token) {
        if (token == null || token == undefined) {
            console.log("Auth token could not be created ");
            responseFormatter.formatServiceResponse(new Error('Error while creating auth-token'), callback);
        } else {
            console.log('auth token switched : ',token);
            userSchema.User.findOne({user_id : payload.user_id},{role_token:1},{lean:true}, function (err, user) {
                console.log('in switchProfile User returned', user);
                if (err){
                    logger.error("Find failed", err);
                    responseFormatter.formatServiceResponse(err, callback);
                }
                else {
                    if(user == null){
                        responseFormatter.formatServiceResponse({}, callback ,'User not found','error',404);
                    }else{
                        var roleTokenObject = {'role' : role, 'token_time': tokenTime, 'token' : payload.device_token};
                        if(user.role_token && user.role_token.length){
                            console.log('in iff --------');
                            for(var i = 0 ; i < user.role_token.length ; i++ ){
                                if(user.role_token[i].role == role){
                                    user.role_token[i].token = payload.device_token;
                                    user.role_token[i].token_time = tokenTime;
                                    roleTokenArray = user.role_token;
                                    roleTokenPresent = true;
                                    break;
                                }
                            }
                            if(roleTokenPresent == false){
                                console.log('in iff   1111 --------',roleTokenObject);
                                user.role_token.push(roleTokenObject);
                                roleTokenArray = user.role_token;
                            }
                        }else{
                            console.log('in iff   555555--------');
                            roleTokenArray[0] =  roleTokenObject;
                        }
                        console.log('roleTokenArray to $set : ',roleTokenArray);
                        userSchema.User.findOneAndUpdate({user_id : payload.user_id},
                            {$addToSet: { role:  role },
                                $set: { 'role_token' : roleTokenArray}},{new : true},function (err, result) {
                                console.log('in user.js updateUser result :: ',result);
                                if(err){
                                    logger.error("Update failed in switchProfile :", err);
                                    responseFormatter.formatServiceResponse(err, callback);
                                }else{
                                    if(result){
                                        responseFormatter.formatServiceResponse({auth_token: token}, callback ,'User Switched Successfully','success',200);
                                    }else{
                                        responseFormatter.formatServiceResponse({}, callback ,'User switch failed','error',404);
                                    }

                                }
                            });

                    }



                }
            });
            /*userSchema.User.update({ user_id : payload.user_id, role_token: { $elemMatch: { role : role } }}, { $addToSet: { role:  role } ,
                $set : { "role_token.$.role" : role , "role_token.$.token" : payload.device_token, "role_token.$.token_time" : tokenTime }} , function(err , data){
                console.log('err : ',err,"  data :: ",data);
                if(err){
                    logger.error("Update failed in switchProfile :", err);
                    return responseFormatter.formatServiceResponse(err, callback);
                } else{
                    responseFormatter.formatServiceResponse({auth_token: token}, callback , 'User Switched Successfully','success','200');

                }
            })*/
        }
    })


}

var validateToken = function(token, callback){
    //check if token is valid
    decodeToken(token, function(err, decodedToken){
//            logger.debug('*******Running validation...');
//            logger.debug('*******token:', token); // should be your token
//            logger.debug('decoded:', decodedToken);  // should be {accountId : 123}.
        if (err){
            callback(null, false);
            return;
        }

        if (decodedToken) {
            console.log('Auth Service validate: ', decodedToken);
        }

        //check if user exists
        //const userModel = require( '../model' );
        userModel.checkUser(decodedToken.user_id, decodedToken.role,decodedToken.device_token,decodedToken.tokenTime, function(response){
            if (response.status == 'error'){
                callback(null, false);
                return;
            }

            if (response.data == null || response.data == undefined) {
                callback(null, false);
                return;
            }

            //if user exists
            if (response.data.exists == true){
                console.log("decoded Data_____",decodedToken.user_id, decodedToken.role, decodedToken.device_token, decodedToken.tokenTime);
                callback(null, true, {user_id:decodedToken.user_id,role : decodedToken.role, device_token : decodedToken.device_token ,token_time : decodedToken.tokenTime});
                return;
            }

            callback(null, false);
        });


    });
}

/**
 * Validates token. Check if token exists in storage and then also
 * verifies the validity. Returns user object if token is valid
 * This also acts as hook for hapi-bearer-token plugin to call for
 * token validation
 *
 */

module.exports.validate =  function(token, callback){
    //check if token exists in storage or not
    logger.debug('Auth token received: ', token);

    storageService.get(token,  function(storageResponse){

        if (storageResponse.status=='error'){
            logger.error('Token lookup failed', storageResponse);
            callback(null, false);
        }
        else if (storageResponse.status == 'success'){
            //do further checks
            validateToken(token, callback);
        }
        else{
            logger.error('Unidentifid response from storage service');
            callback(null, false);
        }
    });

}
