/**
 * Created by cl-macmini-63 on 1/16/17.
 */
'use strict';


const responseFormatter = require('Utils/responseformatter.js');
let commonFunction=require('Utils/commonfunction.js');
const userSchema = require('schema/mongo/userschema');
const userProfileSchema = require('schema/mongo/userprofile');
const gigsSchema = require('schema/mongo/gigsschema');
const phoneSchema = require('schema/mongo/phoneotp');
const favouriteSchema = require('schema/mongo/favourite');
const constantSchema = require('schema/mongo/constantsschema');
const authModel =   require('model/auth.js');
const  log = require('Utils/logger.js');
const logger = log.getLogger();
const messenger = require('Utils/messenger.js');
const phoneOtpModel = require('model/phoneotp.js');
var config=require('../config');
const privateKey = '_1.2v^:69F61n151EodW+!925;-Cx-;m.*Z2=^y463B+9Z.49^%7I%3b62%z%;+I';
var jwt = require('jsonwebtoken');
const storageService = require('model/storageservice.js');
var async=require('async')
var AWS = config.amazon.s3
var bcrypt = require('bcryptjs');
module.exports = {};
const masterServiceSchema = require('schema/mongo/masterserviceschema');
const promotionSchema = require('schema/mongo/promotionschema');
let moment=require('moment');
//Chandan
module.exports.createUser=function(objToSave,callback){
    new userSchema(objToSave).save(callback)
}
module.exports.getUser=function(criteria,projection,options,callback){
    options.lean=true
    userSchema.User.find(criteria,projection,options,callback)
}
module.exports.updateUser=function(criteria,dataToSave,options,callback){
    options.lean=true
    userSchema.User.findOneAndUpdate(criteria,dataToSave,options,callback)
}
module.exports.getPhoneOtp=function(criteria,projection,options,callback){
    phoneSchema.PhoneOtp.find(criteria,projection,options,callback)
}



module.exports.createAuthToken = function(user_id,role,privateKey,deviceToken,currentTime, callback){
    console.log('in user.js Creating auth token from - user_id: ',user_id,"  role : ",role,"  deviceToken :: ",deviceToken, "currentTime ::",currentTime);
    var authToken = jwt.sign({user_id: user_id , role: role, device_token:deviceToken ,tokenTime : currentTime}, privateKey);
    console.log("in createAuthToken () -  auth Token :",authToken);
    if(authToken == null || authToken == undefined){
        callback();
    }
    else{
        callback(authToken);
    }
}


/**
 * Checks if the given user id exists in database or not
 *
 * @param {String}
 *            id User Id
 * @param {Function}
 *            callback Callbacl function
 * @return {void}
 */
module.exports.checkUser = function(id, role ,deviceToken, tokenTime, callback){
    console.log("Searching for user: id : ",id,"   role  :: ",role, "   tokenTime : ",tokenTime);
    userSchema.User.count({'user_id':id ,role_token: { $elemMatch: { role : role , token_time : tokenTime }}}, function (err, count) {
        logger.debug('User returned', count)
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

module.exports.signoutUser1 = function(user_id , role, callback){
    console.log('in signoutUser1 ::: user_id : ',user_id,"   role : ",role);
    userSchema.User.update({ user_id : user_id}, { $pull: { role_token : { role : role } }},function (err, result) {
        console.log('in user.js signoutUser1 result :: ',result);
        if(err){
            logger.error("signoutUser1 failed", err);
            callback(err, null);
        }else{
            if(result.n != 0 || result.nModified !=0){
                callback(null , true);
            }else{
                callback(null , false);
            }

        }
    });

};
module.exports.signoutUser = function(user_id , role, callback){
    userSchema.User.update({ user_id : user_id}, { $pull: { role : role }},function (err, result) {
        console.log('in user.js signoutUser result :: ',result);
        if(err){
            logger.error("signoutUser failed", err);
            callback(err, null);
        }else{
            if(result.n != 0){
                callback(null , true);
            }else{
                callback(null , false);
            }

        }
    });

};

var checkUserByEmail = function(email, callback){
    //logger.debug("Searching for user: ", callback);
    console.log('213 in checkUserByEmail :: ',email);
    userSchema.User.findOne({'email':email}, function (err, user) {
        console.log('User returned', user);
        if (err){
            logger.error("Find failed", err);
            responseFormatter.formatServiceResponse(err, callback);
        }
        else {
            console.log("user",user);
            responseFormatter.formatServiceResponse((user ? user.toJSON() : null), callback);
        }
    });

};

/**
 * Returns user object for the given user id. Fields returned are determined
 * based on the credentials provided. If credentials are same as user requested
 * all fields are passed otherwise only selected fields are returned
 *
 * @param {[type]}
 *            id [description]
 * @param {[type]}
 *            credentials [description]
 * @param {Function}
 *            callback [description]
 * @return {[type]} [description]
 */
module.exports.getUserById = function(id, credentials, callback){
    
    //var requestorId = credentials.user_id;
    console.log('id : ',id,"    credentials : ",credentials);
    var query = userSchema.User.findOne({'email':id});

    // if requestor is the owner send full object
    // otherwise send limited objects only
    var resultHandler = function (err, user) {
        logger.debug('User returned', user)
        if (err){
            logger.error("Find failed", err);
            responseFormatter.formatServiceResponse(err, callback);
        }
        else {
            // logger.debug('user found: ', user);
            responseFormatter.formatServiceResponse((user ? user.toJSON() : null), callback);
        }
    }
    /*if (id === requestorId){
     }
     else{
     query.select(publicView);
     }*/

    query.exec(resultHandler);

};

// get user information
// Current user information
//module.exports.createNewUser = function(payload, callback) {
//    let self = this;
//    var user = new userSchema.User(payload);
//    var userEmail = user.email.toLowerCase();
//    user.email = userEmail;
//    user.role.push(payload.reg_as);
//    console.log('user :: ',user);
//    checkUserByEmail(userEmail,function(response){
//        console.log('response  :: ',response);
//        if (response.status == 'error'){
//            callback();
//            return;
//        }
//        //if user exists
//        if (response.data){
//            var validationError = new Error("User already exist. Please signup with another email id.");
//            validationError.name='ValidationError';
//            console.log('in user.js Validation Error : ',validationError);
//            responseFormatter.formatServiceResponse(validationError, callback);
//
//            //responseFormatter.formatServiceResponse({}, callback, config.message.,'error'l,);
//
//            return;
//        }
//        else{
//            // check if phone number and email is verified
//            console.log('user.mobile, user.email   :  ',user.mobile , user.email);
//            //phoneOtpModel.is_phone_verified(user.mobile, user.email,function(result){
//               //if(result){
//                   user.is_phone_verified = true;
//                   user.is_email_verified = true;
//                   if(user.fb_id){
//                       user.account_type = 'social';
//                   }else{
//                       user.account_type = 'futran';
//                   }
//                   user.on('error', function(err){logger.error('Error saving User: ', err);})
//                   logger.debug("User information: ", user);
//                   user.save(function(err,user){
//                       if (err){
//                           responseFormatter.formatServiceResponse(err, callback);
//                       }
//                       else {
//                           console.log("in success :User created successfully");
//                           self.createAuthToken(user.user_id, payload.reg_as,payload.device_token, privateKey, function (token) {
//                               console.log('in user.js signup auth token created :  ',token);
//                               if (token == null || token == undefined) {
//                                   console.log("Auth token could not be created ");
//                                   responseFormatter.formatServiceResponse(new Error('Error while creating auth-token'), callback);
//                               } else {
//                                 var  authToken = token;
//                               }
//                               storageService.store(authToken, user.email, function (storageResponse) {
//                                   if (storageResponse.status == 'error') {
//                                       callback(storageResponse);
//                                   }
//                                   else if (storageResponse.status == 'success') {
//                                       var retData = {}
//                                       retData.user = user;
//                                       retData.authToken = authToken;
//                                       console.log("*********response.data from signup service  ::",retData);
//                                       return responseFormatter.formatServiceResponse(retData, callback , 'User logged in Successfully', 'success',200);
//                                   }
//                                   else {
//                                       responseFormatter.formatServiceResponse(new Error('Unidentified response'), callback , 'internal server error', 400);
//                                   }
//                               });
//                           });
//                       }
//                   });
//               //}
//                /*else{
//                   responseFormatter.formatServiceResponse('', callback,'phone number or email not verified','error',400);
//                   //callback(config.messages.violation.PHONE_EMAIL_NOT_VERIFIED)
//               }*/
//
//            //});
//        }
//    });
//
//};

module.exports.checkPassword = function(email,password, callback){
    logger.debug('user id in authenticate User:', email);
    logger.debug('Password in authenticate user: ', password);
    userSchema.User.findOne({$or:[ {email: email},{mobile : email} ]},function(err, user) {

        // logger.debug('User found in authenticate user', user);
        if (err){
            logger.error('Error finding user', err.message);
            responseFormatter.formatServiceResponse(err, callback);
            return;
        }
        else{
            console.log("user____++++",user)
            if (user == null || user == undefined){
                const regex=/^[0-9]*$/
                const checkmail=regex.test(email)
                console.log("In user service :User not found");
                var authenticationError = new Error('Invalid email or password');
                authenticationError.name='AuthenticationError';
                if(checkmail==true){
                    responseFormatter.formatServiceResponse({}, callback, 'Not Registered Phone Number', 'error',400);
                }
                else{
                    responseFormatter.formatServiceResponse({}, callback, 'Not Registered Email', 'error',400);
                }

                return;
            }

            /*if(user.is_email_verified == false){
             var authenticationError = new Error('Please verify your email before login. We have sent verification link to your email.');
             authenticationError.name='AuthenticationError';
             responseFormatter.formatServiceResponse(authenticationError, callback);
             return;
             }*/
            // match the password
            user.comparePassword(password, function(err, isMatch) {
                if (err){
                    logger.error('Error matching password', err.message);
                    responseFormatter.formatServiceResponse({} , callback,'Invalid Credentials',"error",400);
                    return;
                }

                if (isMatch){
                    responseFormatter.formatServiceResponse(user.toJSON(), callback);
                }
                else{
                    console.log("user____++++",user)
                    console.log("In user service :Password does not match");
                    var authenticationError = new Error('Incorrect password');
                    authenticationError.name='AuthenticationError';
                    responseFormatter.formatServiceResponse({}, callback, 'Incorrect password', 'error',400);
                }
            });
        }

    });
}

module.exports.update = function(payload, callback){
    logger.debug('payload : ', payload);
    var condition = { email : payload.user_id};
    userSchema.User.update(condition, payload, function(err, count){
        if (err){
            logger.error("User Update failed", err);
            callback(err);
        }
        else {
            if(count>0)
                callback();
        }
    });
}


module.exports.updateUserData = function(payload , callback){
    var roleTokenArray = [];
    var roleTokenPresent = false;

    userSchema.User.findOne({$or:[ {email: payload.email},{mobile : payload.email} ]},{},{lean:true}, function (err, user) {
        console.log('in updateUserData User returned', user);
        if (err){
            logger.error("Find failed", err);
            responseFormatter.formatServiceResponse(err, callback);
        }
        else {
            if(user == null){
                responseFormatter.formatServiceResponse({}, callback ,'User not found','error',404);
            }else{
                if(user.role_token && user.role_token.length){
                    console.log('in iff --------');
                    for(var i = 0 ; i < user.role_token.length ; i++ ){
                        if(user.role_token[i].role == payload.roleTokenObject.role){
                            user.role_token[i].token = payload.roleTokenObject.token;
                            user.role_token[i].token_time = payload.roleTokenObject.token_time;
                            roleTokenArray = user.role_token;
                            roleTokenPresent = true;
                            break;
                        }
                    }
                    if(roleTokenPresent == false){
                        console.log('in iff   1111 --------');
                        user.role_token.push(payload.roleTokenObject);
                        roleTokenArray = user.role_token;
                    }
                }else{
                    console.log('in iff   555555--------');
                    roleTokenArray[0]= payload.roleTokenObject;
                }
                console.log('roleTokenArray to $set : ',roleTokenArray);
                userSchema.User.findOneAndUpdate({$or:[ {email: payload.email},{mobile : payload.email} ]},
                    {'app_version'   : payload.app_version,
                        'device_token'  : payload.device_token,'device_type':payload.device_type,
                        'time_zone':payload.time_zone,
                        $set: { 'role_token' : roleTokenArray}},{new : true},function (err, result) {
                        console.log('in user.js updateUser result :: ',result);
                        if(err){
                            logger.error("Find failed", err);
                            responseFormatter.formatServiceResponse(err, callback);
                        }else{
                            if(result.n != 0){
                                responseFormatter.formatServiceResponse({}, callback ,'User Data updated successfully','success',200);
                            }else{
                                responseFormatter.formatServiceResponse({}, callback ,'User not found','error',404);
                            }

                        }
                    });

            }
        }
    });

};
module.exports.updateUserHandler = function(payload , callback){
    let dataToUpdate=payload
 async.series([
     function(cb){
            let x={}
            if (payload.hasOwnProperty("profilePhoto") && payload.profilePhoto) {
                x = payload.profilePhoto.filename;
                let tempPath = payload.profilePhoto.path;
                if(typeof payload.profilePhoto !== 'undefined' && payload.profilePhoto.length){
                    x = payload.profilePhoto[1].filename;
                    tempPath = payload.profilePhoto[1].path;
                }
                let extension = x.split('.').pop();
                let fileName=payload.user_id+commonFunction.generateRandomString()+'.'+extension
                console.log("tempPath",fileName)

                commonFunction.uploadFile(tempPath, fileName, "aLarge", function (err) {

                    if (err) {
                        cb(err);
                    }
                    else {

                        //let x = fileName;

                        //let fileNameFirst = x.substr(0, x.lastIndexOf('.'));


                        dataToUpdate.profilePhoto = {
                            original: AWS.s3URL + AWS.folder.aLarge + "/" + fileName,
                            thumbnail: AWS.s3URL + AWS.folder.aLarge + "/" + payload.user_id + "_thumb." + extension
                        };

                        console.log("file upload success");
                        
                        cb(null)

                    }
                });
            }
            else {
                cb(null);
            }
    },
    function(cb){
         userSchema.User.findOneAndUpdate({user_id:payload.user_id},dataToUpdate,{lean:true,new:true},function(err,data){
                if(err){
                responseFormatter.formatServiceResponse(err, cb);
            }else{
                if(data){
                    let retData = {};
                    retData.user = data;
                    responseFormatter.formatServiceResponse(retData, cb ,'User Data updated successfully','success',200);
                }else{
                    responseFormatter.formatServiceResponse({}, cb ,'User not found','error',400);
                }

            }
        });
            
        }
 ],
 function(err,data){
        if(err){
            callback(err)
        }
        else{
            callback(null)
        }
    }
 )   
};

module.exports.updateUserProfile = function(payload , callback){
    async.series([
            function(cb){
                console.log("condition",payload.cards.fields.Email)
                if(payload.cards.fields.Email){
                    userSchema.User.findOne({email:payload.cards.fields.Email},{},{lean:true},function(err,data){
                        if(err){
                            cb(err)
                        }
                        else{
                            console.log('aaaaaaaaaaaa',data)
                            if(data){
                                responseFormatter.formatServiceResponse({}, cb ,'Email Already Registered','error',400);
                            }
                            else{
                                cb(null)
                            }
                        }
                    })
                }
                else{
                    cb(null)
                }
            },
            function(cb){
                console.log("condition",payload.cards.fields.Phone)
                if(payload.cards.fields.Phone){
                    userSchema.User.findOne({Phone:payload.cards.fields.Phone},{},{lean:true},function(err,data){
                        if(err){
                            cb(err)
                        }
                        else{
                            console.log('aaaaaaaaaaaa',data)
                            if(data){
                                responseFormatter.formatServiceResponse({}, cb ,'Phone Already Registered','error',400);
                            }
                            else{
                                cb(null)
                            }
                        }
                    })
                }
                else{
                    cb(null)
                }
            },
        function(cb){
            let x={}
            if (payload.hasOwnProperty("image") && payload.image) {
                x = payload.image.filename;
                let tempPath = payload.image.path;
                if(typeof payload.image !== 'undefined' && payload.image.length){
                    x = payload.image[1].filename;
                    tempPath = payload.image[1].path;
                }
                let extension = x.split('.').pop();
                let randNumber=commonFunction.generateRandomString()
                let fileName=payload.user_id+randNumber+'.'+extension
                console.log("tempPath",fileName)

                commonFunction.uploadFile(tempPath, fileName, "aLarge", function (err) {

                    if (err) {
                        cb(err);
                    }
                    else {

                        let x = fileName;

                        //let fileNameFirst = x.substr(0, x.lastIndexOf('.'));


                        payload.cards.fields.image = {
                            original: AWS.s3URL + AWS.folder.aLarge + "/" + fileName,
                            thumbnail: AWS.s3URL + AWS.folder.aLarge + "/" + payload.user_id+randNumber+ "_thumb." + extension
                        };

                        console.log("file upload success");
                        console.log("teamPhoto", payload.cards.fields.image);
                        cb(null)

                    }
                });
            }
            else {
                cb(null);
            }
    },
        function(cb){
                console.log("payload Card structure_____________",payload.cards.fields);
                let resetToken=commonFunction.generateRandomStringBigger()
                if(payload.card_type=="Family"){
                    let user = new userSchema.User();
                    user.first_name=payload.cards.fields.firstName
                    user.last_name=payload.cards.fields.lastName
                    user.email=payload.cards.fields.Email
                    user.mobile=payload.cards.fields.Phone
                    user.countryCode=payload.cards.fields.CountryCode
                    user.parent_id=payload.user_id
                    user.is_family_member=true
                    user.passwordResetToken=resetToken
                    user.profilePhoto=payload.cards.fields.image
                    console.log("sssassss",user)
                    user.save(function(err,data){
                        if(err){
                            cb(err)
                        }
                        else{
                            console.log("lllllsksks",data)
                            if (data) {
                                const smsDetails = {
                                    user_name: data.first_name,
                                    password_reset_token:resetToken,
                                    password_reset_link: config.socket.mainServer.ipAddress+':'+config.socket.mainServer.portNumber+'/'+'passwordResetToken=' + resetToken + '&email=' + data.email
                                }
                                // Email To Be Sent
                                const message="Hello"+ " "+ smsDetails.user_name+" "+ "To Reset Password, please click"+" "+smsDetails.password_reset_link
                                console.log("message}}}}",message)
                                messenger.sendEmailToUser('FORGOT_PASSWORD',message,data.email,function(err,msg){
                                    if(err){
                                        cb(err)
                                    }
                                    else{
                                        console.log("Message",msg)
                                        cb(null)
                                    }
                                })
                            }
                            else {
                                cb("Implementation Error")
                            }
                        }
                    })
                }
                else{
                    cb(null)
                }

            },
    function(cb){
        var options = { upsert: true, new: true, setDefaultsOnInsert: true };
        userProfileSchema.UserProfile.findOneAndUpdate({ user_email: payload.user_email }, {$push: {cards : payload.cards},user_id:payload.user_id} ,options,function (err, result) {
            console.log('in user.js updateUser result :: ',result);
            if(err){
                logger.error("Find failed", err);
                responseFormatter.formatServiceResponse(err, cb);
            }else{
                if(result){
                    responseFormatter.formatServiceResponse(result, cb ,'User Data updated successfully','success',200);
                }else{
                    responseFormatter.formatServiceResponse({}, cb ,'User not found','error',400);
                }

            }
        });
    },

    ],
    function(err,data){
        if(err){
            callback(err)
        }
        else{
            callback(null)
        }
    })



};
module.exports.getUserProfileModel=function(payload , callback){

    var options = {lean:true};
    userProfileSchema.UserProfile.find({user_id: payload.user_id}).populate('cards.card','card_type').exec(function (err,result) {
        console.log('in user.js updateUser result :: ',result);
        if(err){
            logger.error("Find failed", err);
            responseFormatter.formatServiceResponse(err, callback);
        }else{
            console.log("result>>>>>",result)
            if(result){
                responseFormatter.formatServiceResponse(result, callback ,'User Profile With Cards','success',200);
            }else{
                responseFormatter.formatServiceResponse({}, callback ,'User not found','error',400);
            }

        }
    });

};

//Chandan Sharma
module.exports.createUserModel=function(payloadData,callback){
    var self=this;
    var dataToSave = payloadData;
    var user = new userSchema.User(dataToSave);
    user.user_id = user._id;
    var savedData = null;
    var authToken = null;
    const tokenTime = new Date().getTime();
    user.token_time = tokenTime;
    var roleTokenObject = {
        "role" : payloadData.reg_as,
        "token": payloadData.device_token,
        'token_time': tokenTime
    };
    user.role.push(payloadData.reg_as);
    user.role_token.push(roleTokenObject);
    if(user.email){
        user.email = user.email.toLowerCase();
    }
    if(payloadData.password==null){
        delete payloadData.password
    }
    console.log("payload password>>>>>>>>>",payloadData.password)
    async.series([
        function(cb){
            userSchema.User.findOne({email:user.email},{},{lean:true},function(err,data){
                if(err){
                    cb(err)
                }
                else{
                    if(data){
                        responseFormatter.formatServiceResponse({}, cb, "Email Already Registered", "error",400)
                    }
                    else{
                        cb(null)
                    }
                }
            })


        },
        function(cb){                                                 // check for phone number uniqueness , uncomment it tomorrow morning after testing with device
            if(payloadData.phone)
            {
                userSchema.User.findOne({'mobile' : payloadData.mobile,countryCode:payloadData.countryCode}, function (err, user) {
                    console.log('response from self.getUser ****:: ',user, "   error : ",err);
                    if (err){
                        logger.error("Find failed", err);
                        cb(err);
                    }
                    else {
                        console.log("user ------- :",user);
                        if(user){
                            responseFormatter.formatServiceResponse({}, cb, "Phone Already Registered", "error",400)
                        }
                        else{
                            cb(null)
                        }

                    }
                });
            }
            else{
                cb(null)
            }

        },
        function(cb){
            if(payloadData.fb_id)
            {
                userSchema.User.findOne({'fb_id' : payloadData.fb_id}, function (err, user) {
                    console.log('response from self.getUser ****:: ',user, "   error : ",err);
                    if (err){
                        logger.error("Find failed", err);
                        cb(err);
                    }
                    else {
                        console.log("user ------- :",user);
                        if(user){
                            responseFormatter.formatServiceResponse({}, cb, "Facebook ID Already Registered", "error",402)
                        }
                        else{
                            cb(null)
                        }

                    }
                });
            }
            else{
                cb(null)
            }

        },
        function(cb){
          if(payloadData.fb_id &&  payloadData.email){
              if(payloadData.password){
                  responseFormatter.formatServiceResponse({}, cb, "Only one field should be filled at a time, either facebook Id or password", "error",400)
              }
              else{
                  cb(null)
              }
          }
            else {
              if(payloadData.email){
                  if(payloadData.password){
                      cb(null)
                  }
                  else{
                      responseFormatter.formatServiceResponse({}, cb, "Password is required", "error",400)
                  }
              }
          }

            //else{
            //    cb(null)
            //    //responseFormatter.formatServiceResponse({}, cb, "Add At least one Credentials for SignUp", "error",400)
            //}
        },
        function (cb) {
            let x={}
            console.log("payloadData profilePhoto",payloadData.profilePhoto)
            console.log("payload Has own property",payloadData.hasOwnProperty("profilePhoto"))
        if (payloadData.hasOwnProperty("profilePhoto") && payloadData.profilePhoto) {
            x = payloadData.profilePhoto.filename;
            let tempPath = payloadData.profilePhoto.path;
            if(typeof payloadData.profilePhoto !== 'undefined' && payloadData.profilePhoto.length){
                x = payloadData.profilePhoto[1].filename;
                tempPath = payloadData.profilePhoto[1].path;
            }
            let extension = x.split('.').pop();
            let fileName=user._id+"."+extension
            console.log("tempPath",tempPath)
            console.log("fileName",fileName)

            commonFunction.uploadFile(tempPath, fileName, "aLarge", function (err) {

                if (err) {
                    cb(err);
                }
                else {

                    let x = fileName;

                    //let fileNameFirst = x.substr(0, x.lastIndexOf('.'));


                    user.profilePhoto = {
                        original: AWS.s3URL + AWS.folder.aLarge + "/" + fileName,
                        thumbnail: AWS.s3URL + AWS.folder.aLarge + "/" + user._id + "_thumb." + extension
                    };

                    console.log("file upload success");
                    console.log("teamPhoto", user.profilePhoto);
                    cb(null)

                }
            });
        }
        else {
            cb(null);
        }
    },
        function(cb){
            if(user.fb_id){
                user.account_type = 'social';
            }else {
                user.account_type = 'futran';
            }

            user.save(function(err,user) {
                if (err) {
                    responseFormatter.formatServiceResponse(err, callback);
                }
                else {
                    console.log("savedData______",user)

                    self.createAuthToken(user.user_id, dataToSave.reg_as, privateKey,dataToSave.device_token,tokenTime, function (token) {
                        console.log('in user.js signup auth token created :  ',token);
                        if (token == null || token == undefined) {
                            console.log("Auth token could not be created ");
                            responseFormatter.formatServiceResponse(new Error('Error while creating auth-token'), cb);
                        } else {
                            authToken = token;
                            storageService.store(authToken, user.user_id, function (storageResponse) {
                                if (storageResponse.status == 'error') {
                                    cb(storageResponse);
                                }
                                else if (storageResponse.status == 'success') {
                                    var retData = {}
                                    retData.user = user;
                                    retData.authToken = authToken;
                                    console.log("*********response.data from signup service  ::",retData);

                                    // Send Welcome Mail to User

                                    const emailDetails = {
                                        user_name: user.first_name+" "+user.last_name,
                                    }
                                    // Email To Be Sent
                                    const message="Hello"+ " "+ emailDetails.user_name+" "+ "Welcome to Futran - in a Ziffy";
                                    console.log("message}}}}",message)
                                    messenger.sendEmailToUser('REGISTRATION_MAIL',message,user.email,function(err,msg){
                                        if(err){
                                            console.log('error sending in Registration mail : ',err);
                                            responseFormatter.formatServiceResponse(err, callback);
                                        }
                                        else{
                                            console.log("Registration Mail sent successfully to user : ",user.email,"Message --",msg);
                                            return responseFormatter.formatServiceResponse(retData, cb , 'User created Successfully', 'success',200);
                                        }
                                    });
                                    //return responseFormatter.formatServiceResponse(retData, cb , 'User created Successfully', 'success',200);
                                }
                                else {
                                    responseFormatter.formatServiceResponse(new Error('Unidentified response'), cb , 'internal server error', 400);
                                }
                            });
                        }

                    });
                }
            });
        }

],function(err){
    if(err){
        callback(err)
    }
    else{
        callback(null,
            {
            savedData:savedData,
            authToken:authToken
        }
        )
    }
})
}
module.exports.getMasterServices = function(callback){
    masterServiceSchema.MasterService.aggregate([
          { "$match" : { is_active : true } },
        { "$project": {
            service_id:1,
            "service_name": 1,
            "service_icon":1,
            "is_active":1,
            "description":1,
            "insensitive": { "$toLower": "$service_name" }
        }},
        { "$sort": { "insensitive": 1 } }
    ]).exec(function(err,data){
        if(err){
            callback(err)
        }
        else{
            if(data && data.length ==0){
                responseFormatter.formatServiceResponse(data, callback, "No masterservices found", "error",400)
            }
            callback(null,data)
        }
    })
};
module.exports.getGigsServices = function(payload,callback){
   // let finalData=null
    /*gigsSchema.Gigs.find({"service_id" : payload.serviceID}).populate({path:'location'}).exec(function(err,data){
        if(err){
            callback(err)
        }
        else{
            if(data && data.length==0){
                responseFormatter.formatServiceResponse([], callback, "No Gigs Found." , "error",400);
            }
            else{
                finalData=data
                console.log("finalData",finalData)
                callback(null,finalData)
            }
        }
    })*/
    gigsSchema.Gigs.aggregate([
        {"$match":{
            "service_id" : payload.serviceID
        }},
        { "$project": {
            service_id:1,
            service_name:1,
            alternate_gig_name:1,
            gig_id:1,
            gig_name:1,
            gig_image:1,
            pricing:1,
            revenue_model:1,
            skill_level:1,
            is_product_based:1,
            gig_categories:1,
            flow:1,
            min_age:1,
            max_fixed_price:1,
            max_hourly_price:1,
            number_of_hours:1,
            gig_booking_options:1,
            tool_required:1,
            additional_comments:1,
            set_unit:1,
            is_active:1,
            addSupplies:1,
            gig_specific_param:1,
            booking_location:1,
            "insensitive": { "$toLower": "$gig_name" }
        }},
        { "$sort": { "insensitive": 1 } }
    ]).exec(function(err,data){
        if(err){
            callback(err)
        }
        else{
            console.log("in getAllGigsModel aggregation>>>>>",data)
            callback(null,data)
        }
    })

};
module.exports.userFavouriteModel=function(payload,callback){
    favouriteSchema.Favourites.find({"seeker_id":payload.seeker_id},{},function(err,data){
        console.log("data in find:",data)
        if(data && data.length)
        {
            let dataToUpdate=payload.gig_id
            favouriteSchema.Favourites.findOneAndUpdate({"seeker_id":payload.seeker_id},{ $addToSet: { "gig_id": { $each: dataToUpdate } } },{lean:true,new:true},function(err,products){
                if (err){
                    //responseFormatter.formatServiceResponse(err, callback);
                    callback(null);
                }
                else {
                    
                    callback(null,products);
                }
            })
            //responseFormatter.formatServiceResponse({}, callback ,'already in favourite list','error',400);
        }
        else{
            const dataSave = new favouriteSchema.Favourites(payload);
    dataSave.save(payload,function(err,data){
                if (err){
                    //responseFormatter.formatServiceResponse(err, callback);
                    callback(null);
                }
                else {
                    console.log("data in if loop",data)
                    callback(null,data);
                }
            }); 
        }
    })
    
};
module.exports.removeFavouriteGig=function(payload,callback){
    let dataToUpdate=payload.gig_id;
    console.log("datatoupdate",dataToUpdate)
    favouriteSchema.Favourites.findOneAndUpdate({"seeker_id":payload.seeker_id},{$pull:{"gig_id":{$in:dataToUpdate}}},{multi:true,lean:true,new:true},function(err,data)
   {
    if(err)
    {
        callback(err);
    }
    else{
       callback(null,data);
    }
   })     
};
module.exports.removeFavouriteService=function(payload,callback){
    let dataToUpdate=payload.gig_id;
    console.log("datatoupdate",dataToUpdate)
    favouriteSchema.Favourites.findOneAndUpdate({"seeker_id":payload.seeker_id,"service_id":payload.service_id},{ $set : {'gig_id': [] }},{multi:true,lean:true,new:true},function(err,data)
   {
    if(err)
    {
        callback(err);
    }
    else{
       callback(null,data);
    }
   })     
};
module.exports.getUserFavouriteModel=function(payload,callback){
    
      favouriteSchema.Favourites.aggregate([
      {
        $match:{
            seeker_id:payload.seeker_id
        }
      },
      {
$lookup:
     {
       from: "gigs",
       localField: "gig_id",
       foreignField:"gig_id" ,
       as: "gig_Favourites"
     }
 },
     {
        $project:{
          "gig_Favourites":1  
        }
     },
    {
        $unwind:"$gig_Favourites"
    }
 

     ]).exec(function(err,data){
        if(err){
            callback(err)
        }
        else{
            console.log("in gigFavouriteUpdateModel aggregation>>>>>",data)
            callback(data)
        }
    })

}

module.exports.forgotPasswordUser = function (payloadData, callback) {
    let emailData=null
    var resetToken=commonFunction.generateRandomStringBigger()
    var passwordUpdated=null
    async.series([
        //Check Whether Atleast one field entered
        function(cb){
            const criteria={
                email:payloadData.email
            }
            const options={
                lean:true
            }
            userSchema.User.findOne(criteria,{},options,function(err,data){
                if(err){
                    cb(err)
                }
                else{
                    console.log("}}}}}",data)
                    if(!data){
                        responseFormatter.formatServiceResponse({}, cb, "This email is not registered" , "error",400);
                    }
                    else{
                        cb(null)
                    }
                    //console.log("data of email",data)
                    //if(data && data.length ==0){
                    //    responseFormatter.formatServiceResponse({}, cb, "Please Enter Registered Email Address" , "error",400);
                    //}
                    //else{
                    //    emailData=data
                    //    console.log("emailData",emailData)
                    //    cb(null)
                    //}

                }
            })
        },
        function(cb){
            const criteria={
                email:payloadData.email
            }
            const dataToUpdate={
                passwordResetToken:resetToken
            }
            const options={
                lean:true,
                new:true
            }
            userSchema.User.findOneAndUpdate(criteria,dataToUpdate,options,function(err,data){
                if(err){
                    cb(err)
                }
                else{
                    passwordUpdated=data
                    console.log("passwordUpdated",passwordUpdated)
                    cb(null)
                }
            })
        },
        function (cb) {
            console.log("env-------",process.env.NODE_ENV)
            let ipAddress=null
            if(process.env.NODE_ENV=='development'){
                ipAddress='52.206.153.254'
            }
            else if(process.env.NODE_ENV=='testing'){
                ipAddress='54.152.122.226'
            }
            if (passwordUpdated) {
                const smsDetails = {
                    user_name: passwordUpdated.first_name,
                    password_reset_token:resetToken,
                    password_reset_link:"http://"+ ipAddress+'/'+'futran-admin-panel'+'/'+'#'+'/'+'page'+'/'+'forgot-password'+'?passwordResetToken=' + resetToken + '&email=' + payloadData.email
                }
           // Email To Be Sent
               const message="Hello"+ " "+ smsDetails.user_name+" "+ "To Reset Password, please click"+" "+smsDetails.password_reset_link
                console.log("message}}}}",message)
                messenger.sendEmailToUser('FORGOT_PASSWORD',message,payloadData.email,function(err,msg){
                    if(err){
                        cb(err)
                    }
                    else{
                        console.log("Message",msg)
                        cb(null)
                    }
                })
            }
            else {
                cb("Implementation Error")
            }
        }


    ], function (err) {
        if (err) {
            callback(err)
        } else {
            callback(null,{reset:resetToken});//TODO Change in production DO NOT Expose the password
        }
    })
};
module.exports.resetPasswordUser=function(payload,callback){
    let SALT_WORK_FACTOR = 12;
    console.log("payload password",payload.newPassword)
    async.series([
    function(cb){
        bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
            if (err) {
                console.log('Error generating salt' + err.message);
                cb(err);
            }

            // hash the password using our new salt
            bcrypt.hash(payload.newPassword, salt, function (err, hash) {
                if (err) {
                    console.log('Error hashing password' + err.message);
                    cb(err);
                }
                // override the cleartext password with the hashed one
                payload.newPassword = hash;
                console.log("in user model: user.password :", payload.newPassword);
                cb(null)
            });
        });
    },
    function(cb){
        userSchema.User.findOne({email:payload.email,passwordResetToken:payload.passwordResetToken},{},{},function(err,data){
            if(err){

            }
            else{
                console.log("data___",data)
                if(!data){
                    responseFormatter.formatServiceResponse({}, cb, "Token not valid with email" , "error",401);
                }
                else{
                    cb(null)
                }
            }
        })
    },
    function(cb){
        console.log("payload password",payload.newPassword)
        userSchema.User.findOneAndUpdate({email:payload.email},{$set:{password:payload.newPassword,passwordResetToken:0}},{upsert:false},function(err){
            if(err){
                cb(err)
            }
            else{
                cb(null)
            }
        })
    }
],function(err){
    if(err){
        callback(err)
    }
    else{
        callback(null)
    }
})
}


module.exports.changePasswordUser = function(payload , callback){

    userSchema.User.findOne({email : payload.email},function(err , user){
        if (err){
            console.log("Find failed in resetPassword() :", err);
            responseFormatter.formatServiceResponse(err, callback);
        }
        else{
            if(user==null || user==undefined){
                console.log("Email you entered does not exist. Please check the email");
                responseFormatter.formatServiceResponse({}, callback,"Email you entered does not exist. Please check the email",'error',404);
            }
            else{
                user.comparePassword(payload.old_password, function(err, isMatch) {
                    if (err){
                        logger.error('Error matching password', err.message);
                        responseFormatter.formatServiceResponse(err, callback);
                        return;
                    }

                    if (isMatch){
                        user.password = payload.new_password;

                        user.on('error', function(err){
                            logger.error('Error saving User: ', err);
                        });

                        //logger.debug("User information: ", user);
                        user.save(function(err,user){
                            if (err){
                                responseFormatter.formatServiceResponse(err, callback);
                            }
                            else {
                                responseFormatter.formatServiceResponse(user, callback,'Password Changed Successfully', 'success', 200);
                            }
                        });
                    }
                    else{
                        console.log("In user service :Old Password does not match");
                        var error = new Error('Old Password does not match');
                        error.name='ValidationError';
                        responseFormatter.formatServiceResponse(error, callback);
                    }

                });

            }
        }
    });
};




module.exports.addOrganizationData = function (payload,user_id, callback) {
    let orgDetails = payload.org_details;
    let finalData = null
    async.series([
        function (cb) {
            if (payload.hasOwnProperty("certificate") && payload.certificate) {
                let fileName = payload.certificate.filename;
                let tempPath = payload.certificate.path;
                if (typeof payload.certificate !== 'undefined' && payload.certificate.length) {
                    fileName = payload.certificate[1].filename;
                    tempPath = payload.certificate[1].path;
                }
                console.log("tempPath", fileName)

                commonFunction.uploadFile(tempPath, fileName, "aLarge", function (err) {

                    if (err) {
                        cb(err);
                    }
                    else {

                        let x = fileName;

                        let fileNameFirst = x.substr(0, x.lastIndexOf('.'));
                        let extension = x.split('.').pop();

                        orgDetails.certificate = {
                            original: AWS.s3URL + AWS.folder.aLarge + "/" + fileName,
                            thumbnail: AWS.s3URL + AWS.folder.aLarge + "/" + fileNameFirst + "_thumb." + extension
                        };
                        console.log("file upload success", orgDetails.certificate);
                        console.log("cerificateimage");
                        cb(null)
                    }
                });
            }
            else {
                cb(null);
            }
        },
        function (cb) {
            if (payload.hasOwnProperty("licence") && payload.licence) {
                let fileName = payload.licence.filename;
                let tempPath = payload.licence.path;
                if (typeof payload.licence !== 'undefined' && payload.licence.length) {
                    fileName = payload.licence[1].filename;
                    tempPath = payload.licence[1].path;
                }
                console.log("tempPath", fileName)

                commonFunction.uploadFile(tempPath, fileName, "aLarge", function (err) {

                    if (err) {
                        cb(err);
                    }
                    else {

                        let x = fileName;

                        let fileNameFirst = x.substr(0, x.lastIndexOf('.'));
                        let extension = x.split('.').pop();

                        orgDetails.licence = {
                            original: AWS.s3URL + AWS.folder.aLarge + "/" + fileName,
                            thumbnail: AWS.s3URL + AWS.folder.aLarge + "/" + fileNameFirst + "_thumb." + extension
                        };
                        console.log("file upload success", orgDetails.licence);
                        console.log("licenceimage");
                        cb(null)
                    }
                });
            }
            else {
                cb(null);
            }
        },
        function (cb) {
            console.log("async series orgDetails", orgDetails);
            //let SPorganization = new SPProfileSchema.SPProfile(orgDetails);
            //SPorganization.profile_id = SPorganization._id;
            //SPorganization.provider_id = provider_id;
            orgDetails.org_tab_flag = true;


            userSchema.User.findOneAndUpdate({"user_id":user_id},
                {'organization_details' : orgDetails},
                {lean:true,new:true},function(err,organizationDetails){
                    console.log("async series updated orgDetails with insurance details :", organizationDetails);
                    if (err){
                        console.log('error in addOrganizationDetails to user profile : ',err);
                        responseFormatter.formatServiceResponse(err, callback);
                    }
                    else {
                        finalData = organizationDetails;
                        cb(null);
                    }
                });
        }
    ], function (err, data) {
        if (err) {
            callback(err)
        }
        else {
            data = finalData;
            console.log("final data after series", data)
            callback(null, data);
        }
    })
}


module.exports.addInsuranceDetails = function (payload, callback) {
    let insuranceDetails = payload.insurance_details;
    let finalData = null
    async.series([
        function (cb) {
            if (payload.hasOwnProperty("insurance_doc") && payload.insurance_doc) {
                let fileName = payload.insurance_doc.filename;
                let tempPath = payload.insurance_doc.path;
                if (typeof payload.insurance_doc !== 'undefined' && payload.insurance_doc.length) {
                    fileName = payload.insurance_doc[1].filename;
                    tempPath = payload.insurance_doc[1].path;
                }
                console.log("tempPath", fileName)

                commonFunction.uploadFile(tempPath, fileName, "aLarge", function (err) {

                    if (err) {
                        cb(err);
                    }
                    else {

                        let x = fileName;

                        let fileNameFirst = x.substr(0, x.lastIndexOf('.'));
                        let extension = x.split('.').pop();

                        insuranceDetails.insurance_doc = {
                            original: AWS.s3URL + AWS.folder.aLarge + "/" + fileName,
                            thumbnail: AWS.s3URL + AWS.folder.aLarge + "/" + fileNameFirst + "_thumb." + extension
                        };
                        console.log("file upload success", insuranceDetails.insurance_doc);
                        console.log("insurance_doc");
                        cb(null)
                    }
                });
            }
            else {
                cb(null);
            }
        },
        function (cb) {
            userSchema.User.findOneAndUpdate({"user_id":payload.user_id},
                {'organization_details.insurance_details' : insuranceDetails, $set:{'organization_details.insurance_tab_flag' : true}},
                {lean:true,new:true},function(err,organizationDetails){
                    console.log("async series updated orgDetails with insurance details :", organizationDetails);
                    if (err){
                        console.log('error in addInsuranceDetails : ',err);
                        responseFormatter.formatServiceResponse(err, callback);
                    }
                    else {
                        finalData = organizationDetails
                        cb(null);
                    }
                })

        }
    ], function (err, data) {
        if (err) {
            callback(err)
        }
        else {
            data = finalData;
            console.log("final data after series", data)
            callback(null, data);
        }
    })
}


module.exports.addBankDetails = function(payload,callback){
    let bank_details = payload.bank_details;

    userSchema.User.findOneAndUpdate({"user_id":payload.user_id},
        {'organization_details.bank_details' : bank_details, $set:{'organization_details.bank_tab_flag' : true}},
        {lean:true,new:true},function(err,organizationDetails){
            console.log("async series updated orgDetails with bank details :", organizationDetails);
            if (err){
                console.log('error in addBankDetails : ',err);
                responseFormatter.formatServiceResponse(err, callback);
            }
            else {
                if(organizationDetails){
                    responseFormatter.formatServiceResponse(organizationDetails , callback,'Bank Details Added successfully','success',200);

                }else{
                    responseFormatter.formatServiceResponse(organizationDetails , callback,'User Organization profile not found','error',404);

                }
            }
        })

};


module.exports.toggleNotificationFlag = function(user_id ,role, payload,callback){

    let objToUpdate = {};
    //let provider_notification_flag = true;
    if(role == 'SEEKER'){
        if(payload.notification_flag == true){
            objToUpdate = {"seeker_notification_flag": true};
        }else{
            objToUpdate = {"seeker_notification_flag": false};
        }
    }
    if(role == 'PROVIDER'){
        if(payload.notification_flag == true){
            objToUpdate = {"provider_notification_flag": true};
        }else{
            objToUpdate = {"provider_notification_flag": false};
        }
    }

    userSchema.User.findOneAndUpdate({user_id : user_id}, objToUpdate ,{new:true},function(err,data){
        if(err){
            responseFormatter.formatServiceResponse(err, callback ,'Error Occurred','error',500);
        }
        else{
            console.log("in toggleNotificationFlag data------------",data);
            if(data){
                var retData = {};
                retData.user = data;
                responseFormatter.formatServiceResponse(retData, callback, 'User Notification status changed successfully', 'success', 200);
            }else{
                responseFormatter.formatServiceResponse({}, callback, 'User Profile not found. Please create your profile first.', 'error', 404);

            }

        }
    })
}


module.exports.toggleBGCFlag = function(payload,callback){

    userSchema.User.findOneAndUpdate({user_id : payload.user_id}, payload ,{new:true},function(err,data){
        if(err){
            responseFormatter.formatServiceResponse(err, callback ,'Error Occurred','error',500);
        }
        else{
            console.log("in toggleBGCFlag data------------",data);
            if(data){
                responseFormatter.formatServiceResponse(data, callback, 'User BGC flags status changed successfully', 'success', 200);
            }else{
                responseFormatter.formatServiceResponse({}, callback, 'User Profile not found. Please create your profile first.', 'error', 404);

            }

        }
    })
}

module.exports.getAllPromotions = function (callback) {
    promotionSchema.Promotion.find({"valid_upto" : { $lte : moment().toISOString()}}, {}, {lean: true}, function (err, data) {
        if (err) {
            responseFormatter.formatServiceResponse(err, callback, "error occurrred", "error", 400)
            //callback(err)
        }
        else {
            if (!data || data.length == 0) {
                responseFormatter.formatServiceResponse([], callback, "Promotions not found", "error", 400)
            }
            else {
                console.log("--------***in user model getAllPromotions Data", data);

                const parallelF = [];
                data.forEach(function (result) {
                    console.log('result.provider_id :: ', result.provider_id);
                    parallelF.push(function (cbb) {
                        userSchema.User.findOne({'user_id':result.provider_id},{first_name:1,last_name:1,profilePhoto:1}, function(err,user){
                            if (err){
                                logger.error("Find failed", err);
                                cbb(err);
                            }
                            else {
                                result.name = user.first_name+" "+user.last_name;
                                result.profile_picture = user.profilePhoto;
                                console.log("--------***Data", result);
                                cbb(null , result);
                            }
                        })
                    })
                });

                async.parallel(parallelF, function (error, data) {
                    console.log('in async paraller result --  error data : ------', error, data);
                    if (error) {
                        console.log('error : ', error);
                        responseFormatter.formatServiceResponse(err, callback, "error occurrred", "error", 400)
                    }
                    else {
                        console.log("final", data)
                        responseFormatter.formatServiceResponse(data, callback, "Promotions fetched successfully", "success", 200);
                        //cb(null , data);
                    }
                });


                /*userSchema.User.findOne({'user_id':provider_id},{first_name:1,last_name:1,profilePhoto:1}, function (err, user) {
                    console.log('Provider Info returned', user);
                    if (err){
                        logger.error("Find failed", err);
                        responseFormatter.formatServiceResponse(err, callback);
                    }
                    else {
                        data.name = user.first_name+" "+user.last_name;
                        data.profile_picture = user.profilePhoto;
                        console.log("--------***Data", data);
                        responseFormatter.formatServiceResponse(data, callback, "Promotions fetched successfully", "success", 200);
                    }
                });*/

            }
        }
    })
}

module.exports.makeFavourites = function(payload,callback){

    favouriteSchema.Favourites.findOneAndUpdate({user_id : payload.user_id, service_id: payload.service_id}, {$push:{gig_id : payload.gig_id}} ,{upsert: true , new:true},function(err,data){
        if(err){
            responseFormatter.formatServiceResponse(err, callback ,'Error Occurred','error',500);
        }
        else{
            console.log("in makeFavourites data------------",data);
            if(data){
                responseFormatter.formatServiceResponse(data, callback, 'User Favourites added successfully', 'success', 200);
            }else{
                responseFormatter.formatServiceResponse({}, callback, 'User Profile not found. Please create your profile first.', 'error', 404);

            }

        }
    })
}


module.exports.getFavouriteServices = function(user_id,callback){
    favouriteSchema.Favourites.find({'user_id': user_id},{'service_id' :1},{lean:true}, function (err, favServices) {
        console.log('Fav Services details returned----------------', favServices);
        if (err){
            logger.error("Find failed", err);
            responseFormatter.formatServiceResponse(err, callback ,'Error Occurred Please Try After Some Time','error',500);
        }
        else {
            if(favServices) {
                let serviceIdsArray = [];
                for(var i = 0 ; i< favServices.length ; i++){
                    serviceIdsArray.push(favServices[i].service_id);
                }
                console.log('serviceIdsArray',serviceIdsArray);
                masterServiceSchema.MasterService.find({ service_id : { $in: serviceIdsArray } }, function (err, services) {
                    console.log('Service returned', services);
                    if (err){
                        logger.error("Find failed", err);
                        responseFormatter.formatServiceResponse(err, callback);
                    }
                    else {
                        console.log("services",services);
                        responseFormatter.formatServiceResponse(services, callback, 'favServices details found', 'success', 200);
                    }
                });

            }
            else{
                responseFormatter.formatServiceResponse({}, callback ,'No Fav Service details Found.','error',404);

            }
        }
    });
}

module.exports.getAllFavGigsForSpecificService = function(service_id , user_id,callback){
    favouriteSchema.Favourites.findOne({'user_id': user_id, 'service_id' : service_id},{'gig_id' :1},{lean:true}, function (err, favGigs) {
        console.log('Fav gigs details returned----------------', favGigs);
        if (err){
            logger.error("Find failed", err);
            responseFormatter.formatServiceResponse(err, callback ,'Error Occurred Please Try After Some Time','error',500);
        }
        else {
            if(favGigs) {
                var result = [];
                let gigIdsArray = favGigs.gig_id

                console.log('gigIdsArray',gigIdsArray);
                gigsSchema.Gigs.find({ gig_id : { $in: gigIdsArray } },{},{lean:true}, function (err, gigsInfo) {

                    //result = gigsInfo.slice(0)
                    console.log('Gigs returned', gigsInfo);

                    for(var i = 0; i < gigsInfo.length ; i++){
                        result[i]={};
                        result[i]._id = gigsInfo[i]._id;
                        result[i].service = gigsInfo[i].service_id;
                        result[i].gig = gigsInfo[i];
                        result[i].service_name = gigsInfo[i].service_name;
                        result[i].service_name = gigsInfo[i].service_name;
                        result[i].gig_name = gigsInfo[i].gig_name;
                        result[i].revenue_model = gigsInfo[i].revenue_model;
                        result[i].pricing = gigsInfo[i].pricing;
                    }
                    if (err){
                        logger.error("Find failed", err);
                        responseFormatter.formatServiceResponse(err, callback);
                    }
                    else {
                        console.log("gigsInfo",gigsInfo);
                        responseFormatter.formatServiceResponse(result, callback, 'favGigs details found', 'success', 200);
                    }
                });

            }
            else{
                responseFormatter.formatServiceResponse([], callback ,'No Fav gigs details Found.','error',404);

            }
        }
    });
}

module.exports.setLanguageParam = function(payload,callback){

    userSchema.User.findOneAndUpdate({user_id : payload.user_id}, payload ,{new:true},function(err,data){
        if(err){
            responseFormatter.formatServiceResponse(err, callback ,'Error Occurred','error',500);
        }
        else{
            console.log("in setLanguageParam data------------",data);
            if(data){
                responseFormatter.formatServiceResponse(data, callback, 'User Language status changed successfully', 'success', 200);
            }else{
                responseFormatter.formatServiceResponse({}, callback, 'User Profile not found. Please create your profile first.', 'error', 404);

            }

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

module.exports.getWalletCreditByUserId = function(user_id, callback) {
    userSchema.User.findOne({'user_id': user_id},{wallet_amount:1},{lean:true}, function (err, user) {
        console.log('User returned', user);
        if (err) {
            logger.error("Find failed", err);
            responseFormatter.formatServiceResponse(err, callback);
        }
        else {
            console.log("user", user);
            constantSchema.constantSchema.findOne({},{credit_value:1},{lean:true},function(err,data){
                if(err){
                    logger.error("Find failed", err);
                    responseFormatter.formatServiceResponse(err, callback);
                }
                else{
                    user.admin_credit_value_constant = data.credit_value;
                    responseFormatter.formatServiceResponse(user, callback ,'User wallet credit details found successfully','success',200);
                }
            })

        }
    });
}