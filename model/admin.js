/**
 * Created by cl-macmini-63 on 1/10/17.
 */

'use strict';


const responseFormatter = require('Utils/responseformatter.js');
const adminSchema = require('schema/mongo/adminschema');
const codeSchema = require('schema/mongo/stateCodes');
const constantSchema = require('schema/mongo/constantsschema');
const mapperSchema = require('schema/mongo/serviceLocationMapper');
const userSchema = require('schema/mongo/userschema');
const SPProfileSchema = require('schema/mongo/SPprofile');
const  log = require('Utils/logger.js');
const logger = log.getLogger();
const mongoose=require('mongoose');
const async=require('async');

//auth token module
const jwt = require('jsonwebtoken');

//custom modules

const storageService = require('model/storageservice.js');

const privateKey = '_1.2v^:69F61n151EodW+!925;-Cx-;m.*Z2=^y463B+9Z.49^%7I%3b62%z%;+I';

module.exports={};

module.exports.privateKey = privateKey;

var decodeToken = function(token, callback){
    //check if token is valid
    var options={}
    jwt.verify(token, privateKey, options, callback);
}

module.exports.decodeToken = decodeToken;


module.exports.createAuthToken = function(email,role,privateKey, callback){
    console.log('email : ',email," role  : ",role);
    var authToken = jwt.sign({email: email , role: role}, privateKey);
    console.log("in createAuthToken () -  auth Token :",authToken);
    if(authToken == null || authToken == undefined){
        callback();
    }
    else{
        callback(authToken);
    }
}


module.exports.authenticateAdmin = function(adminId, password, current_role,callback){
    logger.debug('AuthService authentication...');
    var self = this;
    var authToken;
    //var userService = require('../user/userservice.js');
    checkPassword(adminId, password, function(response){
        console.log('response **** ',response);
        if (response.status == 'success'){
            //if successful add token
            self.createAuthToken(response.data.email,response.data.role[0], privateKey ,function (response){
                if(response == null || response == undefined){
                    console.log("Auth token could not be created ");
                    responseFormatter.formatServiceResponse(new Error('Error while creating auth-token'), callback);
                }else{
                    authToken = response;
                }
            });
            storageService.store(authToken, response.data.user_id, function(storageResponse){
                if (storageResponse.status=='error'){
                    callback(storageResponse);
                }
                else if (storageResponse.status == 'success'){
                    var retData = {}
                    retData.admin = response.data;
                    retData.authToken = authToken;
                    console.log("*********response.data ::",response.data);
                    responseFormatter.formatServiceResponse(retData, callback);
                }
                else{
                    responseFormatter.formatServiceResponse(new Error('Unidentified response'), callback);
                }
            });

        }
        else{
            //send error straight through
            callback(response);
        }
    });

}


function checkPassword(email, password, callback){
    logger.debug('admin id in checkPassword:', email);
    logger.debug('Password in checkPassword : ', password);
    adminSchema.Admin.findOne({ email: email}, function(err, admin) {
        // logger.debug('User found in authenticate admin', admin);
        if (err){
            logger.error('Error finding admin', err.message);
            responseFormatter.formatServiceResponse(err, callback);
            return;
        }

        // keep the message same for both invalid id and password to make it
        // more secure
        if (admin == null || admin == undefined){
            console.log("In admin service :Admin not found");
            var authenticationError = new Error('Invalid email or password');
            authenticationError.name='AuthenticationError';
            responseFormatter.formatServiceResponse(authenticationError, callback);
            return;
        }

        /*if(admin.is_email_verified == false){
         var authenticationError = new Error('Please verify your email before login. We have sent verification link to your email.');
         authenticationError.name='AuthenticationError';
         responseFormatter.formatServiceResponse(authenticationError, callback);
         return;
         }*/
        // match the password
        admin.comparePassword(password, function(err, isMatch) {
            if (err){
                logger.error('Error matching password', err.message);
                responseFormatter.formatServiceResponse(err, callback);
                return;
            }

            if (isMatch){
                responseFormatter.formatServiceResponse(admin.toJSON(), callback);
            }
            else{
                console.log("In admin service :Password does not match");
                var authenticationError = new Error('Invalid email or password');
                authenticationError.name='AuthenticationError';
                responseFormatter.formatServiceResponse(authenticationError, callback);
            }

        });
    });
}



module.exports.signout = function(authToken,  callback){
    logger.debug('AuthService Signout...');
    storageService.remove(authToken, function(storageResponse){
        if (storageResponse.status=='error'){
            logger.error('Error removing token', storageResponse)
            callback(storageResponse);
        }
        else if (storageResponse.status == 'success'){
            var retData = {'signout': true}
            responseFormatter.formatServiceResponse(retData, callback);
        }
        else{
            responseFormatter.formatServiceResponse(new Error('Unidentified response'), callback);
        }
    });


}

var checkAdmin = function(id, role , callback){
    console.log("Searching for Admin : id : ",id,"   roles  :: ",role);
    adminSchema.Admin.count({'email':id,  'role': role}, function (err, count) {
        logger.debug('Admin returned', count)
        if (err){
            logger.error("Find failed", err);
            responseFormatter.formatServiceResponse(err, callback);
        }
        else {
            if (count > 0){
                responseFormatter.formatServiceResponse({exists: true}, callback);
            }
            else{
                responseFormatter.formatServiceResponse({exists: false}, callback);
            }
        }
    });

};


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
            console.log('Admin Service validate: ', decodedToken);
        }

        //check if Admin exists
        checkAdmin(decodedToken.email, decodedToken.role, function(response){
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
                callback(null, true, {user_id:decodedToken.email,role : decodedToken.role});
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


module.exports.createAdmin = function(payload, callback) {
    var admin = new adminSchema.Admin(payload);
    var adminEmail = admin.email.toLowerCase();
    admin.email = adminEmail;
    admin.role = 'ADMIN';
    console.log('admin :: ',admin);
    admin.on('error', function(err){logger.error('Error saving admin: ', err);})
    logger.debug("admin information: ", admin);
    admin.save(function(err,admin){
        if (err){
            responseFormatter.formatServiceResponse(err, callback);
        }
        else {
            console.log("in success :admin created successfully");
            responseFormatter.formatServiceResponse(admin, callback);
        }
    });
};
module.exports.addCodesModel=function(payload,callback){
    let codes= new codeSchema.CodeSchema(payload)
    codes.save(function(err,data){
        if(err){
            callback(err)
        }
        else{
            callback(null,data)
        }
    })
}
module.exports.addConstantModel=function(payload,callback){
    let constant= new constantSchema.constantSchema(payload)
    constant.save(function(err,data){
        if(err){
            callback(err)
        }
        else{
            callback(null,data)
        }
    })
}
module.exports.updateConstantModel=function(payload,callback){
    console.log("updateConstantModel function start >>>",payload)
    var id=mongoose.Types.ObjectId(payload.constants_id)
    constantSchema.constantSchema.findOneAndUpdate({_id:id},{ payload /*booking_timer:payload.booking_timer*/},{lean:true,new:true},function(err,data){
        if(err){
            callback(err)
        }
        else{
            callback(null,data)
        }
    })
}

module.exports.getConstantModel=function(callback){
    constantSchema.constantSchema.find({},{},{lean:true},function(err,data){
        if(err){
            callback(err)
        }
        else{
            callback(null,data[0])
        }
    })
}
module.exports.getCodesModel = function(callback){
    //codeSchema.CodeSchema.find({}, function (err, data) {
    //    if (err){
    //        logger.error("Find failed", err);
    //        responseFormatter.formatServiceResponse(err, callback);
    //    }
    //    else {
    //        console.log(data)
    //        responseFormatter.formatServiceResponse(data, callback ,'','success',200);
    //    }
    //});
    codeSchema.CodeSchema.aggregate([
        { "$project": {
            place:1,
            code:1,
            placeType:1,
            country:1,
            "insensitive": { "$toLower": "$place" }
        }},
        { "$sort": { "insensitive": 1 } }
    ]).exec(function(err,data){
        if(err){
            callback(err)
        }
        else{
            console.log("in getCodesModel aggregation>>>>>",data)
            callback(data)
        }
    })
}
module.exports.getMappedCodesModel = function(callback){
   mapperSchema.Mapper.distinct("location",function(err,mapperData){
    if(err)
    callback(err);
else{
        let loc=[]
        mapperData.forEach(function(res){
            console.log("res",res)
        loc.push(function(cb){
        codeSchema.CodeSchema.find(res,function(err,location)
        {
            if(err){
                cb(err);
            }

           else
            cb(null,location[0]);
        })

    })

 })
    async.parallel (loc,function(error, data) {
                    console.log('error data : ------', error, data);
                    if (error) {
                        console.log('error : ', error);
                        return callback(err);
                    }
                    else {
                        console.log("final data in format", data)
                        callback(null,data);
                    }
                })
}
})
   
};

module.exports.getAllSeekers = function(callback){
    userSchema.User.find({role : 'SEEKER'},{},{lean:true},function(err,data){
        if(err){
            callback(err)
        }
        else{
            callback(null,data)
        }
    })
}


module.exports.getAllProviders=function(callback){

    const parallelF = [];
    async.waterfall([
        function (cb) {
            userSchema.User.find({role : 'PROVIDER'}, {
            }, {lean: true}, function (err, data) {
                console.log('err~~~~~', err, ' All provider found data ~~~~~~~ ', data.length);
                if (err) {
                    cb(err);
                }
                else {
                    cb(null, data);
                }
            })
        },
        function (providers, cb) {

            providers.forEach(function (result) {
                console.log('result.provider_id :: ', result.user_id);
                parallelF.push(function (cbb) {
                    SPProfileSchema.SPProfile.findOne({provider_id :result.user_id },{is_approved:1,profile_id:1},function(err,data){
                        if(err){
                            cbb(err)
                        }
                        else{
                            if(data){
                                result.is_approved = data.is_approved;
                                result.profile_id = data.profile_id;
                                cbb(null,result);
                            }else{
                                result.is_approved = false;
                                cbb(null,result);
                            }

                        }
                    })
                })
            });

            async.parallel(parallelF, function (error, data) {
                console.log('in async paraller result --  error data : ------', error, data);
                if (error) {
                    console.log('error : ', error);
                    return cb(error);
                }
                else {
                    //console.log("final", data)
                    cb(null , data);
                }
            });

        }
    ], function (err, data) {
        console.log("in waterfall final", err, data);
        if (err) {
            console.log("err+++++++", err);
            callback(err);
        }
        else {
            //console.log("data+++++++", data);
            callback(null , data);
        }
    });
}

module.exports.getUserDetailsByUserId = function(user_id , callback){
    userSchema.User.find({user_id :user_id },{},{lean:true},function(err,data){
        if(err){
            callback(err)
        }
        else{
            callback(null,data);
        }
    })
}

module.exports.AddOrDeductWalletAmountByUserId = function(payload, callback){
    let count = 0;
    if(payload.add_flag){
        count = Number(payload.amount);
    }
    if(payload.deduct_flag){
        count = Number(-payload.amount);
    }
    userSchema.User.findOneAndUpdate({user_id :payload.user_id },{ $inc: { wallet_amount : count } },{projection: { "wallet_amount" : 1 },new:true},function(err,data){
        if(err){
            callback(err)
        }
        else{
            callback(null,data);
        }
    })
}

module.exports.approveProviderByProfileId = function(profile_id, callback){
    SPProfileSchema.SPProfile.findOneAndUpdate({profile_id :profile_id },{ $set: { is_approved : true } },{new:true},function(err,data){
        if(err){
            callback(err)
        }
        else{
            callback(null,data);
        }
    })

}
module.exports.changeUserStatusByUserId = function(payload, callback){
    userSchema.User.findOneAndUpdate({user_id :payload.user_id },{ $set: { is_active : payload.is_active } },{new:true},function(err,data){
        if(err){
            callback(err)
        }
        else{
            callback(null,data);
        }
    })
}
