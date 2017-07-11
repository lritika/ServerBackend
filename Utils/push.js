/**
 * Created by Chandan Sharma on 27/02/17.
 */
    'use strict'
//var Path = require('path');
var gcm = require('node-gcm');
const pushSchema = require('schema/mongo/pushSchema.js');
var apns = require('apn');
var _ = require('underscore');
var async = require('async');
const Path = require('path');
//var UniversalFunctions = require('Utils/UniversalFunctions');
var pushConfiguration = require('config').constants.pushCreds
/*
 ==========================================================
 Send the notification to the iOS device for customer
 ==========================================================
 */
var options = {};
function sendIosPushNotification(iosDeviceToken, message, payload, USER_TYPE) {
    try{
    console.log("sending ios push to--", iosDeviceToken, "message--", message, "data--",payload, "user type--", USER_TYPE, "flag");
    console.log("IOS device token",iosDeviceToken),
        console.log("IOS device token",message)
    console.log("payload in push function",payload)
    console.log("USER_TYPE____",USER_TYPE)
    var certificate;
    var gateway;
    if (USER_TYPE === "SEEKER") {
        certificate = pushConfiguration.iOSPushSettings.seeker.iosApnCertificate;
        console.log("certificates.........",certificate)
        gateway = pushConfiguration.iOSPushSettings.seeker.gateway;
        options = {
            cert: certificate,
            certData: null,
            key: certificate,
            keyData: null,
            passphrase: 'click',
            ca: null,
            pfx: null,
            pfxData: null,
            gateway: gateway,
            port: 2195,
            debug: true
            //errorCallback: true,
            //rejectUnauthorized: true,
            //enhanced: true,
            //cacheLength: 100,
            //autoAdjustCache: true,
            //connectionTimeout: 0,
            //ssl: true
        };
    } else if (USER_TYPE === "PROVIDER") {
        certificate = pushConfiguration.iOSPushSettings.provider.iosApnCertificate;
        gateway = pushConfiguration.iOSPushSettings.provider.gateway;
        console.log("certificates.........",certificate)
        console.log("gateway.........",gateway)
        options = {
            cert: certificate,
            certData: null,
            key: certificate,
            keyData: null,
            passphrase: 'click',
            ca: null,
            pfx: null,
            pfxData: null,
            gateway: gateway,
            port: 2195,
            debug: true,
            //errorCallback: true
            //rejectUnauthorized: true,
            //enhanced: true,
            //cacheLength: 100,
            //autoAdjustCache: true,
            //connectionTimeout: 0,
            //ssl: true
        };
    }
    var status = 1;
    var msg = message;
    var snd = 'ping.aiff';
    var apnsConnection = new apns.Connection(options, function (err) {
        //console.log(err)
    });
    var note = new apns.Notification();

    note.expiry = Math.floor(Date.now() / 1000) + 3600;
    note.contentAvailable = 1;
    note.sound = snd;
    note.badge = 0;
    note.alert = msg;
    note.newsstandAvailable = status;
    note.payload = {message: message, data: payload};

console.log("note.payload++++++++++",note.payload)
    const regex=/^[a-fA-F0-9]+$/
    const deviceHex=regex.test(iosDeviceToken)
    console.log("regex result",deviceHex)
    if(deviceHex==true){
        var device = new apns.Device(iosDeviceToken);
        apnsConnection.pushNotification(note, device);
    }
    else{
        console.log("Push misses failing device token")
    }


console.log("device45645678985",device)
    //_.each(iosDeviceToken, function (token) {
    //    if (!token || token == "(null)" || token == "deviceToken" || !token.length || token.length !== 64) {
    //       console.log("error with ios push token", token);
    //    } else {
    //
    //    }
    //});
    apnsConnection.on('error', function (errCode, notification, device) {
        console.log("error >>>>", errCode);
        //console.log("error");
        //console.trace("device", device);
    });
    apnsConnection.on('transmitted', function (errCode, notification, device) {
        console.log("transmitted >>>>", errCode);
        //console.log("transmitted");
        //console.trace("device", device);
    });
    apnsConnection.on('timeout', function (errCode, notification, device) {
        console.log("timeout >>>>", errCode);
        //console.log("timeout");
        //console.trace("device", device);
    });
    apnsConnection.on('connected', function (errCode, notification, device) {
        console.log("connected >>>>", errCode);
        //console.log("connected");
        //console.trace("device", device);
    });
    apnsConnection.on('disconnected', function (errCode, notification, device) {
        console.log("disconnected >>>>", errCode);
        //console.log("disconnected");
        //console.trace("device", device);
    });
    apnsConnection.on('socketError', function (errCode, notification, device) {
        console.log("socketError >>>>", errCode);
        //console.log("socketError");
        //console.trace("device", device);
    });
    apnsConnection.on('transmissionError', function (errCode, notification, device) {
        console.log("transmissionError >>>>", errCode);
        //console.log("transmissionError");
        console.log("device", device);

    });
        }
        catch (e)
        {
            console.log("Push misses due to invalid device token",e)
        }
}


/*
 ==============================================
 Send the notification to the android device
 =============================================
 */
function sendAndroidPushNotification(deviceToken,message, payload, userType,callback) {
    console.log("deviceToken------------",deviceToken)
    console.log("message on Android",message)
    console.log("messageData------------",payload)
    var FCM = require('fcm').FCM;
       if(userType=='SEEKER'){
           var fcm = new FCM(pushConfiguration.androidPushSettings.seeker.gcmSender);
     }
    else if(userType=='PROVIDER'){
           console.log("in provider++++++++++++++++")
           var fcm = new FCM(pushConfiguration.androidPushSettings.provider.gcmSender);
       }
    else{
           console.log("came in else after seeker and provider",userType)
       }
    var status = 1;
    var msg = message;
    var snd = 'ping.aiff';
    var messageFinal = {
        registration_id: deviceToken, // required
        collapse_key: 'demo',
        'data.messageToDisplay': message,
        'data.info': JSON.stringify(payload),
        'data.notificationType': "Booking"
        //data:{
        // notificationType:"Booking"
        //},
        //'data.message' : 'HELLO',
        //'data.payload' : payload
        //notification:{
        //    title:'Push Notification',
        //    body:{
        //        expiry : Math.floor(Date.now() / 1000) + 3600,
        //        contentAvailable : 1,
        //         sound : snd,
        //         badge : 0,
        //        alert : msg,
        //        newsstandAvailable : status,
        //        payload : {message: message, data: payload},
        //    }
        //}

    };
    console.log("messageData------------",messageFinal)
    fcm.send(messageFinal, function(err, data){
        if (err) {
            console.log("Something has gone wrong!");
            console.log("ANDROID NOTIFICATION ERROR: " + JSON.stringify(err));
        } else {
            console.log("Sent with message ID: ", data);
            console.log("ANDROID NOTIFICATION RESULT: " + JSON.stringify(data));
        }
    });

}
//function sendAndroidPushNotification(deviceTokens, text, payload, USER_TYPE) {
//
//    var brandName = "";
//    var gcmSender = "";
//    if (USER_TYPE === "SEEKER") {
//        brandName = pushConfiguration.androidPushSettings.seeker.brandName;
//        gcmSender = pushConfiguration.androidPushSettings.seeker.gcmSender;
//    }
//    if (USER_TYPE === "PROVIDER") {
//        brandName = pushConfiguration.androidPushSettings.provider.brandName;
//        gcmSender = pushConfiguration.androidPushSettings.provider.gcmSender;
//    }
//    payload['body'] = text;
//    payload['title'] = "Futran";
//    var message = new gcm.Message({
//        collapseKey: 'demo',
//        priority: 'high',
//        content_available: true,
//        delay_while_idle: true,
//        time_to_live: 604800,
//        data: payload,
//        //notification: {
//        //    title: "Ivy",
//        //    body: text,
//        //    sound: "default"
//        //}
//    });
//    var sender = new gcm.Sender(gcmSender);
//    sender.send(message, {registrationTokens: deviceTokens}, 10, function (err, result) {
//        if (err) {
//            //console.log(err)
//        } else {
//            //console.log(result)
//        }
//    });
//}


function sendPush(pushDetails, userType,callback) {
    console.log('in push.js sendPush() pushDetails --- ',pushDetails,  '  userType : ',userType, '  callback ---> ',callback);
    let pushFinal = null;
    async.series([
        function(cb){
            const pushDataSave = new pushSchema.pushSchema(pushDetails.payload);
            pushDataSave.save(function(err,pushData){
                if (err){
                    console.log('in push.js sendPush() error occurred : ',err);
                    //responseFormatter.formatServiceResponse(err, callback);
                    cb(null);
                }
                else {
                    pushFinal = pushData;
                    console.log("in push.js sendPush() pushFinal data --->",pushFinal)
                    cb(null);
                }
            });    
        },
        function(cb){ 
            console.log("pushDetails_________+++++++",pushDetails)
    var androidPushTokens = [];
    var iosPushTokens = [];
    var devices = pushDetails.deviceDetails;
    console.log("devices+++++++++++++++++",devices)

    for (var i = 0; i < devices.length; i++) {
        console.log("kuch accha ",devices)
        if (devices[i].device_token) {
            var deviceToken = devices[i].device_token;
            var deviceType = devices[i].device_type;
            console.log("77777777777",deviceToken)
            console.log("888888888",deviceType)
            if (deviceType === "ANDROID"){
                //androidPushTokens.push(deviceToken);
                sendAndroidPushNotification(deviceToken, pushDetails.text, pushDetails.payload || null, userType,cb);
            }

            else if (deviceType === "IOS"){
               // iosPushTokens.push(deviceToken);
                console.log("iosPushTokens.length ",iosPushTokens.length )
                console.log("pushDetails.payload ",pushDetails.payload)
                console.log("iosPushTokens ",iosPushTokens[0])
                console.log("push Details ",pushDetails)
                console.log("ios push notification deviceToken",deviceToken)
                sendIosPushNotification(deviceToken, pushDetails.text, pushDetails.payload || null, userType,cb);
            }

        }
    }
    try {
        if (androidPushTokens.length > 0) {

        }
        if (iosPushTokens.length > 0) {

        }
    } catch (e) {
        console.log("Push Notification Exception Caught ? ", e);
    }
}],function(err,data){
        console.log('in final push function : data : ',data);
        if(err){
            callback(err)
        }
        else{
            data=pushFinal;
            console.log("final push data is:",data);
            //setTimeout(function(){self.isBookingAcceptedBySP(bookingFinal._id,callback)},60000);
            callback(null,data)
        }
    })
   
}

module.exports = {
    sendPush: sendPush
};


/*
 *
 *
 *



 var deliveryObj    = result.updateDelivery.deliveryObj;
 var availbleDriver = result.availableDriver;
 var driverList     = [];
 var spHandler      = {
 name: UniversalFunctions.formatName(customer.name),
 date: deliveryObj.deliveryTime
 };
 var deviceDetails  = [];
 for (var i = 0; i < availbleDriver.length; i++) {
 driverList.push(availbleDriver[i]._id);
 deviceDetails.push({
 deviceType: availbleDriver[i].deviceType,
 deviceToken: availbleDriver[i].deviceToken
 });
 }
 var payload       = {
 requestId: deliveryObj.quickieRequest,
 deliveryId: deliveryObj._id,
 };
 var pushDetailsSP = {
 deviceDetails: deviceDetails,
 text: Views.template.bookingRequestToSP(spHandler),
 payload: payload
 };
 Notification.sendPush(pushDetailsSP, UniversalFunctions.Constants.APP_CONSTANTS.DATABASE.USER_ROLES.DRIVER);


 *
 * */