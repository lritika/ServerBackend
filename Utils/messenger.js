'use strict'
let config=require('config')
var client = require('twilio')(config.constants.twilioCreds.accountSid, config.constants.twilioCreds.authToken);
var nodeMailerModule = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var transporter = nodeMailerModule.createTransport(smtpTransport(config.constants.Mandrill));
let async=require('async');
//var apns = require('apn');
module.exports.sendSMSToUser = function (messageType,otp,countryCode,phoneNo,callback) {
    console.log('sendSMSToUser',otp);

    var templateData = {
        forgotPasswordMessage:"Your Link to Forgot Password is",
        sendOTP:"Your OTP for Verification is"
    };
    var smsOptions = {

        from: config.constants.twilioCreds.smsFromNumber,
        To: countryCode+phoneNo.toString(),
        Body: null
    };

    async.series([
        function (cb) {
            switch(messageType){
                case 'OTP_SMS': smsOptions.Body=('Dear User '  +','+ ' ' +'Your One Time Password is '+otp+'.'+ ' ' +'Please enter this code to verify');
                    break;
                case 'FORGOT_PASSWORD':smsOptions.Body=(templateData.forgotPasswordMessage);


                    break;
                case 'STEP_ONE':smsOptions.Body='Dear'+ ' ' + ' ' +"You Are Almost Done And On Your Way To Extra Income And Freedom";

                    break;
                case 'STEP_TWO':smsOptions.Body='Dear'+ ' ' + ' ' +"Thanks For Submitting";

            }
            cb(null);
        }, function (cb) {
            sendSMS(smsOptions, function (err, res) {
                cb(err, res);
            })
        }
    ], function (err) {
        if (err) {
            callback(err);
        } else {
            callback(null);
        }
    });
};
function sendSMS(smsOptions, cb) {
    client.messages.create(smsOptions, function (err, message) {
        if (err) {
            console.log("error response",err)
        }
        else {
            console.log("response message",message);
        }
    });
    cb(null, null); // Callback is outside as sms sending confirmation can get delayed by a lot of time
}

module.exports.sendEmailToUser = function (emailType, message, emailId, callback) {
    var mailOptions = {
        from: "support@gigsinajiffy.com",//TODO move to Global Config
        to: emailId,
        subject: null,
        html: null
    };
    async.series([
        function (cb) {
            switch (emailType) {
                case 'REGISTRATION_MAIL' :
                    mailOptions.subject = emailType;
                    mailOptions.html = message;
                    break;
                case 'FORGOT_PASSWORD' :
                    mailOptions.subject = emailType;
                    mailOptions.html = message;
                    break;
                case 'SEND_OTP' :
                    mailOptions.subject = emailType;
                    mailOptions.html = message;
                    break;
                //case 'DRIVER_CONTACT_FORM' :
                //    mailOptions.subject = Config.APP_CONSTANTS.notificationMessages.contactDriverForm.emailSubject;
                //    mailOptions.html = renderMessageFromTemplateAndVariables(Config.APP_CONSTANTS.notificationMessages.contactDriverForm.emailMessage, emailVariables);
                //    break;
                //case 'BUSINESS_CONTACT_FORM' :
                //    mailOptions.subject = Config.APP_CONSTANTS.notificationMessages.contactBusinessForm.emailSubject;
                //    mailOptions.html = renderMessageFromTemplateAndVariables(Config.APP_CONSTANTS.notificationMessages.contactBusinessForm.emailMessage, emailVariables);
                //    break;
                //case 'NOTIFICATION':
                //    mailOptions.subject = emailVariables.subject;
                //    mailOptions.html = renderMessageFromTemplateAndVariables(Config.APP_CONSTANTS.notificationMessages.notification.emailMessage, emailVariables);
                //    break;
            }
            cb();

        }, function (cb) {
            sendMailViaTransporter(mailOptions, function (err, res) {
                cb(err, res);
            })
        }
    ], function (err, responses) {
        if (err) {
            callback(err);
        } else {
            callback();
        }
    });

};
function sendMailViaTransporter(mailOptions, cb) {
    transporter.sendMail(mailOptions, function (error, info) {
        console.log('Mail Sent Callback Error:', error);
        console.log('Mail Sent Callback Ifo:', info);
    });
    cb(null, null); // Callback is outside as mail sending confirmation can get delayed by a lot of time
}



////Push Notification
// module.exports.sendPushToUser = function (NotifData, userID, callback) {
//    console.log('sendPushToAgent', NotifData, userID);
//
//    var deviceToken = NotifData.device_token;
//    var deviceType = NotifData.device_type;
//    var sendTo = "AGENT";
//    var dataToSend = NotifData.dataToSend;
//    //  var data = {"notificationMessage":dataToSend.notificationMessage, "notificationType" : dataToSend.notificationType, "userId": agentId, "adminId": adminId};
//    if (deviceType == "ANDROID"|| deviceType == "IOS") {
//        if (deviceType == "ANDROID") {
//            console.log('Android Push Notification');
//            console.log([deviceToken], dataToSend, sendTo);
//            sendAndroidPushNotification([deviceToken], dataToSend, sendTo);
//            callback('sentPushToAgent');
//        } else if (deviceType == "IOS") {
//            console.log('IOS Push Notification');
//            sendIosPushNotification([deviceToken], dataToSend, sendTo);
//            callback('sentPushToAgent');
//        }
//    } else {
//        callback();
//    }
//}
//
//
//function sendAndroidPushNotification(deviceToken, message) {
//
//    console.log(message)
//
//    var message = new gcm.Message({
//        collapseKey: 'demo',
//        delayWhileIdle: false,
//        timeToLive: 2419200,
//        data: {
//            message: message,
//            brand_name: config.constants.pushCreds.androidPushSettings.user.brandName
//        }
//    });
//    var sender = new gcm.Sender(config.androidPushSettings.gcmSender);
//    var registrationIds = [];
//    registrationIds.push(deviceToken);
//
//    sender.send(message, registrationIds, 4, function (err, result) {
//        if (debugging_enabled) {
//            console.log("ANDROID NOTIFICATION RESULT: " + JSON.stringify(result));
//            console.log("ANDROID NOTIFICATION ERROR: " + JSON.stringify(err));
//        }
//    });
//}
//function sendIosPushNotification(iosDeviceToken, message, payload) {
//
//    console.log(payload);
//
//    //console.log(config.iOSPushSettings.iosApnCertificate);
//   //console.log(config.iOSPushSettings.gateway);
//
//    if (payload.address) {
//        payload.address = '';
//    }
//    var status = 1;
//    var msg = message;
//    var snd = 'ping.aiff';
//    //if (flag == 4 || flag == 6) {
//    //    status = 0;
//    //    msg = '';
//    //    snd = '';
//    //}
//
//
//    var options = {
//        cert: config.constants.pushCreds.iOSPushSettings.user.iosApnCertificate,
//        certData: null,
//        key: config.constants.pushCreds.iOSPushSettings.user.iosApnCertificate,
//        keyData: null,
//        passphrase: 'click',
//        ca: null,
//        pfx: null,
//        pfxData: null,
//        gateway: config.constants.pushCreds.iOSPushSettings.user.gateway,
//        port: 2195,
//        rejectUnauthorized: true,
//        enhanced: true,
//        cacheLength: 100,
//        autoAdjustCache: true,
//        connectionTimeout: 0,
//        ssl: true
//    };
//
//
//    var deviceToken = new apns.Device(payload.device_token);
//    var apnsConnection = new apns.Connection(options);
//    var note = new apns.Notification();
//
//    note.expiry = Math.floor(Date.now() / 1000) + 3600;
//    note.contentAvailable = 1;
//    note.sound = snd;
//    note.alert = msg;
//    note.newsstandAvailable = status;
//    note.payload = {message: payload};
//
//    apnsConnection.pushNotification(note, deviceToken);
//
//    // Handle these events to confirm that the notification gets
//    // transmitted to the APN server or find error if any
//    function log(type) {
//        return function () {
//            if (debugging_enabled)
//                console.log("iOS PUSH NOTIFICATION RESULT: " + type);
//        }
//    }
//
//    apnsConnection.on('error', log('error'));
//    apnsConnection.on('transmitted', log('transmitted'));
//    apnsConnection.on('timeout', log('timeout'));
//    apnsConnection.on('connected', log('connected'));
//    apnsConnection.on('disconnected', log('disconnected'));
//    apnsConnection.on('socketError', log('socketError'));
//    apnsConnection.on('transmissionError', log('transmissionError'));
//    apnsConnection.on('cacheTooSmall', log('cacheTooSmall'));
//
//}