/**
 * Created by cl-macmini-63 on 2/6/17.
 */

'use strict';
const responseFormatter = require('Utils/responseformatter.js');
const SPProfileSchema = require('schema/mongo/SPprofile');
var SPGigLocationMappingSchema = require('schema/mongo/SPgiglocationmapper');
const messenger = require('Utils/messenger.js');
var bookingSchema = require('schema/mongo/bookingschema');
const gigServiceSchema = require('schema/mongo/gigsschema');
const SPGigLocationMapperSchema = require('schema/mongo/SPgiglocationmapper');
const SPpushcount = require('schema/mongo/SPpushcount');
const stateCodesSchema = require('schema/mongo/stateCodes');
const userSchema = require('schema/mongo/userschema')
const spTimeSchema = require('schema/mongo/SPtimeslots');
const gigsSchema = require('schema/mongo/gigsschema');
const SPLocationMapping = require('schema/mongo/serviceLocationMapper')
const constantsSchema = require('schema/mongo/constantsschema');
const log = require('Utils/logger.js');
const logger = log.getLogger();
const async = require('async');
const commonFunction = require('Utils/commonfunction.js');
const distance = require('google-distance-matrix');
const bookingModel = require('model/bookingmodel')
const sendPush = require('Utils/push.js');
const Mongoose = require('mongoose')
var config = require('config');
let AWS = config.amazon.s3;
let geocoder = require('geocoder');
var paginator = require('Utils/paginate.js');
var SPGigProductInfoSchema = require('schema/mongo/SPgigproductinfo');
let _ = require('lodash');
const adminGlobalDataSchema = require('schema/mongo/adminglobaldata');
bookingSchema.Booking.paginate = paginator.paginate;
var mongoose = require('mongoose');





var sendPushToUnavailableProviders = function (unavailableProviders , callback) {
    console.log("********** In sendPushToUnavailableProviders *************");

    const parallelF = []
    unavailableProviders.forEach(function (result) {
        console.log("result+++++++++++", result)
        parallelF.push(function (cbb) {
            userSchema.User.findOne({user_id: result.provider_id}, {
                device_token: 1,
                device_type: 1,
                role_token:1,
                first_name:1,
                last_name:1,
                profilePhoto:1,
                provider_notification_flag:1
            }, {lean: true}, function (err, userData) {
                console.log('response :: err :: ', err, "   userData", userData);
                if (err) {
                    cbb(err)
                }
                else {
                    const n = new Date();
                    const deviceDetails = [];
                    let deviceToken = null;
                    let deviceType = userData.device_type;
                    let deviceTokenFound = false;
                    if(userData.role_token && userData.role_token.length){
                        for(var i = 0; i < userData.role_token.length; i++){
                            if(userData.role_token[i].role == 'PROVIDER'){
                                deviceToken = userData.role_token[i].token;
                                deviceTokenFound = true;
                                break;
                            }
                        }
                    }
                    if(!deviceTokenFound || userData.provider_notification_flag == false){
                        console.log('in sendPushToUnavailableProviders Failed to Send Push......Device Token not found for ',result.provider_id," Either this provider is logged out or his notification_flag is false");
                        cbb(null, true);
                     }else{
                        let provider_name = userData.first_name+" "+userData.last_name;
                        deviceDetails.push({
                            device_type: deviceType , //userData.device_type,
                            device_token: deviceToken // userData.device_token
                        });
                        const pushDetailsSP = {
                            deviceDetails: deviceDetails,
                            text: "You Have a New Booking Available but your availability is off",
                            payload: {
                                "push_type"      : 'notify-UnavailableProvider',
                                "message"        : "You Have a New Booking Available but your availability is off"},
                                "provider_name"  : provider_name,
                                "provider_image" : userData.profilePhoto,
                                "booking_type"   : 'ODS'
                        }
                        sendPush.sendPush(pushDetailsSP, "PROVIDER");
                        cbb(null, true)
                    }
                }
            });
        });
    })
    console.log("paralleF", parallelF);
    async.parallel(parallelF, function (error, data) {

        if (error) {

            return callback(error);
        }
        else {
            console.log("in sendPushToUnavailableProviders parallelF final data", data)
            callback(null, data)
        }
    });

}




var createBookingForSystemSelect = function (user, callback) {
    console.log("********** In createBookingForSystemSelect *************");

    let seekerData = null
    let bookingData = null
    let gigData = null
    async.series([
        function (cb) {
            // console.log("user data in seeker select", user)
            // console.log("seeker_id++++++++", user.seeker_id)
            userSchema.User.findOne({user_id: user.seeker_id}, {}, {lean: true}, function (err, data) {
                if (err) {
                    return cb(err)
                }
                else {
                    seekerData = data
                    return cb(null)
                }
            })
        },
        function (cb) {
            gigsSchema.Gigs.findOne({gig_id: user.gig_id}, {
                gig_id: 1,
                service_id: 1,
                gig_name: 1,
                service_name: 1
            }, {lean: true}, function (err, data) {
                if (err) {
                    return  cb(err)
                }
                else {
                    gigData = data
                    return cb(null)
                }
            })
        },
        function (cb) {
            let newBooking = new bookingSchema.Booking()
            newBooking.seeker_id = user.seeker_id
            newBooking.seeker_name = user.seeker_name,
                newBooking.seeker_device_token = user.seeker_device_token,
                newBooking.seeker_device_type = user.seeker_device_type,
                newBooking.ODS_type = user.ODS_type
            newBooking.booking_item_info.gig_name = gigData.gig_name
            newBooking.booking_item_info.service_name = gigData.service_name
            newBooking.booking_item_info.service_id = user.service_id
            newBooking.booking_item_info.gig_id = user.gig_id
            newBooking.tools = user.tools
            newBooking.supplies = user.supplies
            newBooking.description = user.description
            //newBooking.is_product_based=user.is_product_based
            newBooking.unit = user.unit
            newBooking.quantity = user.quantity
            newBooking.status = 'Unconfirmed'
            newBooking.seeker_image = {
                original: seekerData.profilePhoto.original,
                thumbnail: seekerData.profilePhoto.thumbnail
            }

            newBooking.booking_datetime = new Date().toISOString()
            if (user.is_seeker_location == true) {
                if (user.virtual_address) {
                    newBooking.is_seeker_location = user.is_seeker_location,
                        newBooking.virtual_address = user.virtual_address
                }
                else {
                    newBooking.is_seeker_location = user.is_seeker_location;
                    newBooking.booking_address = user.booking_address;
                    newBooking.booking_latitude = user.booking_latitude;
                    newBooking.booking_longitude = user.booking_longitude;
                    newBooking.booking_address1 = user.booking_address1;
                    newBooking.booking_latitude1 = user.booking_latitude1;
                    newBooking.booking_longitude1 = user.booking_longitude1;
                }

            } else {
                newBooking.is_seeker_location = user.is_seeker_location
            }
            newBooking.save(function (err, data) {
                if (err) {
                    cb(err)
                }
                else {
                    bookingData = data;
                    // console.log("saved data for booking", bookingData)
                    cb(null)
                }
            })

        }
    ], function (err, data) {
        //console.log("series end final", err, data);
        if (err) {
            callback(err);
        }
        else {
            console.log("new System select booking created successfully ==================================")
            callback(null, bookingData);
        }
    })
}




var notifySPForSystemSelect = function (provider,user, bookingData, callback) {
    console.log("********** In Push *************");

    let seekerData = null
    let gigData = null
    async.series([
        function (cb) {
            userSchema.User.findOne({user_id: user.seeker_id}, {}, {lean: true}, function (err, data) {
                if (err) {
                    return cb(err)
                }
                else {
                    seekerData = data
                    return cb(null)
                }
            })
        },
        function (cb) {

            userSchema.User.findOne(
                {user_id: provider.provider_id},
                {
                    device_token: 1,
                    device_type: 1,
                    role_token:1,
                    provider_notification_flag:1
                },
                {lean: true},
                function (err, userData) {
                    console.log('response :: err :: ', err, "   userData", userData);
                    if (err) {
                        cb(err)
                    }
                    else {
                        if(userData == null){
                            console.log('Unable to find User Data corresponding to provider_id :',provider.provider_id," So failed to send push");
                            cb(err);
                        }else{
                            const pushCount = new SPpushcount.SPPush({
                                booking_id: bookingData._id,
                                provider_id: provider.provider_id,
                            })
                            pushCount.save(function (err) {
                                if (err) {
                                    cb(err)
                                }
                                else {
                                    const n = new Date();
                                    const deviceDetails = [];

                                    let deviceToken = null;
                                    let deviceType = userData.device_type;
                                    let deviceTokenFound = false;


                                    if(userData.role_token && userData.role_token.length){
                                        for(var i = 0; i < userData.role_token.length; i++){
                                            if(userData.role_token[i].role == 'PROVIDER'){
                                                deviceToken = userData.role_token[i].token;
                                                deviceTokenFound = true;
                                                break;
                                            }
                                        }
                                    }
                                    console.log('deviceTokenFound --->',deviceTokenFound);
                                    if(!deviceTokenFound || userData.provider_notification_flag == false){
                                        console.log('in notifySPForSystemSelect Failed to Send Push......Device Token not found for ',provider.provider_id," Either this provider is logged out or role_token object is not present in user collection.");
                                        cb(null, true);
                                    }else{
                                        console.log('in notifySPForSystemSelect sending push to ......',provider.provider_id,"  deviceType : ",deviceType,"    DeviceToken :",deviceToken);
                                        const bookPayload = {};
                                        if (user.booking_address1) {
                                            bookPayload.booking_address1 = user.booking_address1
                                        }
                                        else {
                                            bookPayload.booking_address1 = ''
                                        }
                                        if (user.virtual_address) {
                                            bookPayload.virtual_address = user.virtual_address
                                        }
                                        else {
                                            bookPayload.virtual_address = ''
                                        }
                                        if (user.booking_address) {
                                            bookPayload.booking_address = user.booking_address
                                            //      console.log(" bookPayload.booking_address ", bookPayload.booking_address)
                                        }
                                        else {
                                            bookPayload.booking_address = {}
                                        }
                                        bookPayload.profile_photo = seekerData.profilePhoto,
                                            bookPayload.first_name = seekerData.first_name,
                                            bookPayload.last_name = seekerData.last_name,
                                            bookPayload.booking_type = bookingData.booking_type,
                                            bookPayload.booking_id = bookingData._id,
                                            bookPayload.booking_data = n.toISOString(),
                                            bookPayload.push_type = 'new booking' ,
                                            bookPayload.ODS_type = user.ODS_type,
                                            bookPayload.is_seeker_location = user.is_seeker_location,
                                            //bookPayload.is_product_based=user.is_product_based
                                            bookPayload.push_date = n.toISOString(),
                                            bookPayload.bid_amount = "",
                                            //bookPayload.pricing=location.pricing

                                            deviceDetails.push({
                                                device_type: deviceType,
                                                device_token: deviceToken
                                            });
                                        //  console.log("bookPayload data System Select", bookPayload)
                                        const pushDetailsSP = {
                                            deviceDetails: deviceDetails,
                                            text: "You Have a New Booking Available Please Confirm",
                                            payload: bookPayload
                                        }
                                        sendPush.sendPush(pushDetailsSP, "PROVIDER");
                                        cb(null, true)
                                    }
                                }
                            });
                        }
                    }
                });

        }
    ], function (err, data) {
        console.log("series end final", err, data);
        if (err) {
            callback(err);
        }
        else {
            console.log("=========================== new System select push SENT==================================")
            callback(null, bookingData);
        }
    })
}




var reverseBid = function (providers, user, bidAmount, callback) {
    let seekerData = null
    let bookingData = null
    let gigData = null
    async.series([
        function (cb) {
            console.log("seeker_id++++++++", user.seeker_id)
            userSchema.User.findOne({user_id: user.seeker_id}, {}, {options: true}, function (err, data) {
                if (err) {
                    cb(err)
                }
                else {
                    seekerData = data
                    cb(null)
                }
            })
        },
        function (cb) {
            gigsSchema.Gigs.findOne({gig_id: user.gig_id}, {
                gig_id: 1,
                service_id: 1,
                gig_name: 1,
                service_name: 1
            }, {lean: true}, function (err, data) {
                if (err) {
                    cb(err)
                }
                else {
                    gigData = data
                    cb(null)
                }
            })
        },
        function (cb) {
            let newBooking = new bookingSchema.Booking()
            newBooking.seeker_id = user.seeker_id
            newBooking.seeker_name = seekerData.first_name+"  "+seekerData.last_name,
                newBooking.seeker_device_token = user.seeker_device_token,
                newBooking.seeker_device_type = user.seeker_device_type,
                newBooking.ODS_type = user.ODS_type
            newBooking.booking_item_info.gig_name = gigData.gig_name
            newBooking.booking_item_info.service_name = gigData.service_name
            newBooking.booking_item_info.service_id = user.service_id
            newBooking.booking_item_info.gig_id = user.gig_id
            newBooking.booked_price_value=bidAmount
            newBooking.tools = user.tools
            newBooking.supplies = user.supplies
            newBooking.description = user.description
           // newBooking.booking_address = user.booking_address;
            newBooking.unit = user.unit
            newBooking.quantity = user.quantity
            newBooking.status = 'Unconfirmed'
            newBooking.seeker_image.original = seekerData.profilePhoto.original
            newBooking.seeker_image.thumbnail = seekerData.profilePhoto.thumbnail
            newBooking.booking_datetime = new Date().toISOString()
            if (user.is_seeker_location == true) {
                if (user.virtual_address) {
                    newBooking.is_seeker_location = user.is_seeker_location,
                        newBooking.virtual_address = user.virtual_address
                }
                else {
                    newBooking.is_seeker_location = user.is_seeker_location;
                    newBooking.booking_address = user.booking_address;
                    newBooking.booking_latitude = user.booking_latitude;
                    newBooking.booking_longitude = user.booking_longitude;
                    newBooking.booking_address1 = user.booking_address1;
                    newBooking.booking_latitude1 = user.booking_latitude1;
                    newBooking.booking_longitude1 = user.booking_longitude1;
                }

            } else {
                newBooking.is_seeker_location = user.is_seeker_location
            }
            newBooking.save(function (err, data) {
                if (err) {
                    cb(err)
                }
                else {
                    bookingData = data
                    cb(null)
                }
            })
            /*if(payload.is_product_based==false){

             }
             /*else{
             cb(null)
             }*/
        },
        function (cb) {
            const parallelF = []
            providers.forEach(function (result) {
                console.log("result+++++++++++", result)
                parallelF.push(function (cbb) {
                    userSchema.User.findOne({user_id: result.provider_id}, {
                        device_token: 1,
                        device_type: 1,
                        role_token:1,
                        provider_notification_flag:1
                    }, {lean: true}, function (err, userData) {
                        console.log('response :: err :: ', err, "   userData", userData);
                        if (err) {
                            cbb(err)
                        }
                        else {

                            const pushCount = new SPpushcount.SPPush({
                                booking_id: bookingData._id,
                                provider_id: result.provider_id,
                            })
                            pushCount.save(function (err) {
                                if (err) {
                                    cb(err)
                                }
                                else {

                                    const n = new Date();
                                    const deviceDetails = [];

                                    let deviceToken = null;
                                    let deviceType = userData.device_type;
                                    let deviceTokenFound = false;


                                    if(userData.role_token && userData.role_token.length){
                                        for(var i = 0; i < userData.role_token.length; i++){
                                            if(userData.role_token[i].role == 'PROVIDER'){
                                                deviceToken = userData.role_token[i].token;
                                                deviceTokenFound = true;
                                                break;
                                            }
                                        }
                                    }
                                    if(!deviceTokenFound || userData.provider_notification_flag == false){
                                        console.log('in reverseBid Failed to Send Push......Device Token not found for ',result.provider_id," Either this provider is logged out or role_token object is not present in user collection.");
                                        cbb(null, true);

                                    }else{
                                        const bookPayload = {};
                                        if (user.booking_address1) {
                                            bookPayload.booking_address1 = user.booking_address1
                                        }
                                        else {
                                            bookPayload.booking_address1 = ''
                                        }
                                        if (user.virtual_address) {
                                            bookPayload.virtual_address = user.virtual_address
                                        }
                                        else {
                                            bookPayload.virtual_address = ''
                                        }
                                        if (user.booking_address) {
                                            bookPayload.booking_address = user.booking_address
                                        }
                                        else {
                                            bookPayload.booking_address = {}
                                        }

                                        bookPayload.profile_photo = seekerData.profilePhoto,
                                            bookPayload.first_name = seekerData.first_name,
                                            bookPayload.last_name = seekerData.last_name,
                                            bookPayload.booking_type = bookingData.booking_type,
                                            bookPayload.booking_id = bookingData._id,
                                            bookPayload.booking_data = n.toISOString(),

                                            bookPayload.push_type = 'new booking' ,
                                            bookPayload.ODS_type = user.ODS_type,
                                            bookPayload.is_seeker_location = user.is_seeker_location,
                                            bookPayload.is_product_based = user.is_product_based
                                        bookPayload.push_date = n.toISOString(),
                                            bookPayload.bid_amount = bidAmount
                                        /*if(user.is_product_based==false){

                                         }*/
                                        /*  else{
                                         bookPayload.profile_photo = seekerData.profilePhoto,
                                         bookPayload.first_name = seekerData.first_name,
                                         bookPayload.last_name = seekerData.last_name,
                                         bookPayload.booking_type = user.booking_type,
                                         bookPayload.booking_id = '',
                                         bookPayload.booking_data = n.toISOString(),
                                         bookPayload.booking_address = bookingData.booking_address,
                                         bookPayload.push_type = 'new booking' ,
                                         bookPayload.ODS_type=user.ODS_type,
                                         bookPayload.is_seeker_location = user.is_seeker_location,
                                         bookPayload.is_product_based=user.is_product_based
                                         bookPayload.push_date =  n.toISOString(),
                                         bookPayload.bid_amount = ""
                                         }*/
                                        deviceDetails.push({
                                            device_type: deviceType,
                                            device_token: deviceToken
                                        });
                                        console.log("bookPayload data System Select", bookPayload)
                                        const pushDetailsSP = {
                                            deviceDetails: deviceDetails,
                                            text: "You Have a New Booking Available Please Confirm",
                                            payload: bookPayload
                                        }
                                        sendPush.sendPush(pushDetailsSP, "PROVIDER");
                                        cbb(null, true)
                                    }

                                }
                            });
                        }
                    });
                });
            })
            console.log("paralleF", parallelF);
            async.parallel(parallelF, function (error, data) {

                if (error) {

                    return cb(error);
                }
                else {
                    console.log("__________", data)
                    cb(null, data)
                }
            });
        }
    ], function (err, data) {
        console.log("sbse final", err, data);
        if (err) {
            callback(err)
        }
        else {
            console.log("bookingData+++++++", bookingData)
            callback(null, bookingData)
        }
    })

}

var seekerSelect = function (providers, quantity, locationId, callback) {

    const parallelF = [];
    console.log("locationId---->", locationId);
    console.log("providersData---->", providers);
    //var providerinfo = {};
    providers.forEach(function (result) {
        console.log('result.provider_id :: ', result.provider_id);
        parallelF.push(function (cbb) {

            async.waterfall([
                function (cb) {
                    userSchema.User.findOne({user_id: result.provider_id}, {
                        email: 1,
                        first_name: 1,
                        last_name: 1,
                        mobile: 1,
                        countryCode: 1,
                        profilePhoto: 1,
                        address: 1,
                        dob:1
                    }, {lean: true}, function (err, data) {
                        console.log('err~~~~~', err, ' data ~~~~~~~ ', data);
                        if (err) {
                            cb(err)
                        }
                        else {
                            //providerinfo=data
                            cb(null, data);
                        }
                    })
                },
                function (providerinfo, cb) {
                    SPGigLocationMapperSchema.SPGigLocationMapper.findOne({
                        provider_id: result.provider_id,
                        'location.locationID': locationId
                    }, {revenue: 1, pricing: 1, min_hourly_amount: 1, _id: 0}, {lean: true}, function (err, data) {
                        console.log('err-----', err, 'pricing data initial------- ', data);
                        if (err) {
                            cbb(err, null)
                        }
                        else {
                            if (data && data.pricing) {
                                for (var i = 0; i < data.pricing.length; i++) {
                                    if (data.pricing[i].type == 'fixed') {
                                        console.log('seekerSelect inital price fixed : ', data.pricing[i].value);
                                        data.pricing[i].value = data.pricing[i].value * quantity;
                                        console.log('seekerSelect final price fixed : ', data.pricing[i].value);

                                    }
                                    if (data.pricing[i].type == 'hourly') {
                                        console.log('seekerSelect inital price hourly : ', data.pricing[i].value);
                                        data.pricing[i].value = data.pricing[i].value * data.min_hourly_amount;
                                        console.log('seekerSelect final price hourly : ', data.pricing[i].value);
                                    }
                                }
                                console.log('pricing data final :: ', data);
                                var age = (new Date().getFullYear() - new Date(providerinfo.dob).getFullYear());
                                providerinfo.age = age;
                                result.pricingDetails = data;
                                result.providerInfo = providerinfo;
                                cbb(null, result);
                            } else {
                                cbb(null ,null);
                                /*var age = (new Date().getFullYear() - new Date(providerinfo.dob).getFullYear());
                                providerinfo.age = age;
                                result.providerInfo = providerinfo;
                                cbb(null, result);*/
                            }

                        }
                    }).sort({_id: -1}).limit(1)
                }
            ], function (err, data) {
                console.log("sbse final", err, data);
                if (err) {
                    console.log("err+++++++", err)
                }
                else {
                    console.log("data+++++++", data)
                }
            })

        })
    });

    console.log("paralleF", parallelF);

    async.parallel(parallelF, function (error, data) {
        console.log('error data : ------', error, data);
        if (error) {
            console.log('error : ', error);
            return callback();
        }
        else {
            console.log("in seekerSelect final", data);
            data.filter(function(val) { if(val)return val }).join(", ");
            console.log("in seekerSelect final ***** ", data);
            callback(data);
        }
    });


}
var lowestDeal = function (providers, quantity, locationId, callback) {

    const parallelF = []
    console.log("in lowestDeal ----->  locationID", locationId, " quantity  :",quantity,"  providers :: ",providers);
    providers.forEach(function (result) {
        parallelF.push(function (cbb) {
            async.waterfall([
                function (cb) {
                    userSchema.User.findOne({user_id: result.provider_id}, {
                        email: 1,
                        first_name: 1,
                        last_name: 1,
                        mobile: 1,
                        countryCode: 1,
                        profilePhoto: 1,
                        address: 1,
                        dob:1
                    }, {lean: true} , function (err, data) {
                        console.log('err~~~~~', err, ' data ~~~~~~~ ', data);
                        if (err) {
                            cb(err)
                        }
                        else {
                            //providerinfo=data
                            cb(null, data);
                        }
                    })
                },
                function (providerinfo, cb) {
                    console.log("locationID, provider_id ", locationId);
                    SPGigLocationMapperSchema.SPGigLocationMapper.findOne({
                        provider_id: result.provider_id,
                        'location.locationID': locationId
                    }, {
                        revenue: 1,
                        pricing: 1,
                        min_hourly_amount: 1,
                        discount: 1,
                        _id: 0
                    }, {lean: true}, function (err, data) {
                        console.log('err-----', err, 'pricing data initial------- ', data);
                        if (err) {
                            cbb(err, null)
                        }
                        else {
                            let discount = null;
                            if(data.discount){
                                discount = data.discount;
                            }
                            else{
                                discount = 0;
                            }
                            if (data && data.pricing && discount !=0) {
                                for (var i = 0; i < data.pricing.length; i++) {
                                    if (data.pricing[i].type == 'fixed') {
                                        console.log('lowestDeal inital price fixed : ', data.pricing[i].value);
                                        //data.pricing[i].value = data.pricing[i].value * quantity;
                                        data.pricing[i].value = data.pricing[i].value - (discount / 100 * data.pricing[i].value);
                                        data.pricing[i].value = data.pricing[i].value * quantity;
                                        data.pricing[i].value = data.pricing[i].value.toFixed(2);
                                        console.log('lowestDeal final price fixed : ', data.pricing[i].value);

                                    }
                                    if (data.pricing[i].type == 'hourly') {
                                        console.log('lowestDeal inital price hourly : ', data.pricing[i].value);
                                        //data.pricing[i].value = data.pricing[i].value * quantity;
                                        data.pricing[i].value = data.pricing[i].value - (discount / 100 * data.pricing[i].value);
                                        data.pricing[i].value = data.pricing[i].value * data.min_hourly_amount;
                                        data.pricing[i].value = data.pricing[i].value.toFixed(2)
                                        console.log('lowestDeal final price hourly : ', data.pricing[i].value);

                                    }
                                }
                                console.log('pricing data final :: ', data);
                                var age = (new Date().getFullYear() - new Date(providerinfo.dob).getFullYear());
                                providerinfo.age = age;
                                result.pricingDetails = data;
                                result.providerInfo = providerinfo;
                                console.log("providerinfo result in gig location mapper", result);
                                cbb(null, result);
                            } else {

                                // Do nothing
                                console.log('in lowest deal , else No pricing details or discount is 0');
                                cbb(null , null);

                                /*var age = (new Date().getFullYear() - new Date(providerinfo.dob).getFullYear());
                                providerinfo.age = age;
                                result.providerInfo = providerinfo;
                                cbb(null, result);*/
                            }

                        }
                    }).sort({_id: -1}).limit(1)
                }
            ], function (err, data) {
                console.log("sbse final", err, data);
                if (err) {
                    console.log("err+++++++", err)
                }
                else {
                    console.log("data+++++++", data)
                }
            })

        })
    });

    console.log("paralleF", parallelF);

    async.parallel(parallelF, function (error, data) {

        if (error) {
            console.log('error : ', error);
            return callback(error);
        }
        else {
            console.log("in lowestDeal final", data)
            console.log("providers lowest deal data", providers)
            //callback(providers);
            data.filter(function(val) { if(val)return val }).join(", ");
            callback(data);
        }
    });


}


module.exports = {};

module.exports.createSPProfile = function (payload, callback) {

    console.log("in model createSPProfile : payload   ", payload);
    let dataToSave = payload
    let SPProfileRecord = new SPProfileSchema.SPProfile(dataToSave);
    SPProfileRecord.profile_id = SPProfileRecord._id;
    console.log(' SPProfileRecord :: ', SPProfileRecord);
    let savedData = null
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

                        SPProfileRecord.certificate = {
                            original: AWS.s3URL + AWS.folder.aLarge + "/" + fileName,
                            thumbnail: AWS.s3URL + AWS.folder.aLarge + "/" + fileNameFirst + "_thumb." + extension
                        };

                        console.log("file upload success");
                        console.log("teamPhoto", SPProfileRecord.certificate);
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

                        SPProfileRecord.licence = {
                            original: AWS.s3URL + AWS.folder.aLarge + "/" + fileName,
                            thumbnail: AWS.s3URL + AWS.folder.aLarge + "/" + fileNameFirst + "_thumb." + extension
                        };

                        console.log("file upload success");
                        console.log("teamPhoto", SPProfileRecord.licence);
                        cb(null)

                    }
                });
            }
            else {
                cb(null);
            }
        },
        function (cb) {
            SPProfileRecord.save(function (err, savedProfileRecord) {
                if (err) {
                    responseFormatter.formatServiceResponse(err, cb);
                }
                else {
                    savedData = savedProfileRecord
                    console.log("in success : SPProfileRecord created successfully");
                    responseFormatter.formatServiceResponse(savedProfileRecord, cb, 'SP Profile created successfully', 'success', 200);
                }
            });
        }
    ], function (err, data) {
        if (err) {
            callback(err)
        }
        else {
            data = savedData
            callback(null, data)
        }
    })


};


module.exports.AddServicesAndGigs = function (payload, callback) {
    console.log("payload.service_and_gigs_info.level", payload.service_and_gigs_info.gigs.level)
    payload.service_and_gigs_info.gigs.level = (payload.service_and_gigs_info.gigs.level).split(',')
    console.log("payload.service_and_gigs_info.level", payload.service_and_gigs_info.gigs.level)
    console.log('in SPProfile model :  Payload == ', payload);
    // If service already exists with some gigs then push gigs info in service_and_gigs_info.gigs[] :

    SPProfileSchema.SPProfile.update({
            provider_id: payload.provider_id,
            "service_and_gigs_info.service_id": payload.service_and_gigs_info.service_id,
            "service_and_gigs_info.gigs": payload.service_and_gigs_info.gigs.gig_id
        },
        {$addToSet: {"service_and_gigs_info.$.gigs": payload.service_and_gigs_info.gigs}}, function (err, result) {
            console.log('AddServicesAndGigs result :: ', result);
            if (err) {
                logger.error("Find failed", err);
                responseFormatter.formatServiceResponse(err, callback);
            } else {
                if (result.n != 0) {
                    responseFormatter.formatServiceResponse({}, callback, 'Service and Gig added successfully to Provider profile', 'success', 200);
                } else { // else create a new embedded service_and_gigs_info doc with service and first gig data.
                    SPProfileSchema.SPProfile.update({provider_id: payload.provider_id},
                        {$addToSet: {"service_and_gigs_info": payload.service_and_gigs_info}}, function (err, result) {
                            console.log('$addToSet AddServicesAndGigs result :: ', result);
                            if (err) {
                                logger.error("Find failed", err);
                                responseFormatter.formatServiceResponse(err, callback);
                            } else {
                                if (result.n != 0) {
                                    responseFormatter.formatServiceResponse({}, callback, 'Service and Gig added successfully to Provider profile', 'success', 200);
                                } else {
                                    responseFormatter.formatServiceResponse({}, callback, 'Provider not found', 'error', 404);
                                }

                            }
                        });
                }

            }
        });

};
module.exports.AddServicesAndGigs1 = function (payload, callback) {

    payload.service_and_gigs_info.gigs.level = (payload.service_and_gigs_info.gigs.level).split(',')
    console.log('in SPProfile model :  Payload == ', payload);
    var gigFound = false;

    // Note - > Finding info from gig table whether this gig is product based or not.
    gigsSchema.Gigs.findOne({gig_id: payload.service_and_gigs_info.gigs.gig_id}, {
        gig_id: 1,
        is_product_based: 1
    }, {lean: true}, function (err, gig) {
        console.log('in AddServicesAndGigs1 gig info returned -- gig : ', gig);
        if (err) {
            logger.error("Find failed", err);
            responseFormatter.formatServiceResponse(err, callback);
        }
        else {
            payload.service_and_gigs_info.gigs.is_product_based = gig.is_product_based;
            console.log('in SPProfile model :  Payload changed  == ', payload);

            SPProfileSchema.SPProfile.findOne({
                    provider_id: payload.provider_id,
                    "service_and_gigs_info.service_id": payload.service_and_gigs_info.service_id
                }, {service_and_gigs_info: 1},
                function (err, result) {
                    console.log('AddServicesAndGigs result :: ', result);
                    if (err) {
                        logger.error("Find failed", err);
                        responseFormatter.formatServiceResponse(err, callback);
                    } else {
                        if (!result) {
                            SPProfileSchema.SPProfile.update({provider_id: payload.provider_id},
                                {$addToSet: {"service_and_gigs_info": payload.service_and_gigs_info}}, function (err, result) {
                                    console.log('$addToSet AddServicesAndGigs result :: ', result);
                                    if (err) {
                                        logger.error("Find failed", err);
                                        responseFormatter.formatServiceResponse(err, callback);
                                    } else {
                                        if (result.n != 0) {
                                            responseFormatter.formatServiceResponse({}, callback, 'Service and Gig added successfully to Provider profile', 'success', 200);
                                        } else {
                                            responseFormatter.formatServiceResponse({}, callback, 'Provider not found', 'error', 404);
                                        }
                                    }
                                });
                        } else {
                            for (var i = 0; i < result.service_and_gigs_info.length; i++) {
                                if (result.service_and_gigs_info[i].service_id == payload.service_and_gigs_info.service_id) {
                                    console.log('service found : at : ', i);
                                    for (var j = 0; j < result.service_and_gigs_info[i].gigs.length; j++) {
                                        if (result.service_and_gigs_info[i].gigs[j].gig_id == payload.service_and_gigs_info.gigs.gig_id) {
                                            gigFound = true;
                                            console.log('gigFound :: ', gigFound, "at : ", j);
                                            var crt = 'service_and_gigs_info.' + i + ".gigs." + j;
                                            var obj = {};
                                            obj[crt] = payload.service_and_gigs_info.gigs
                                            SPProfileSchema.SPProfile.update({
                                                    provider_id: payload.provider_id,
                                                    "service_and_gigs_info.service_id": payload.service_and_gigs_info.service_id,
                                                    "service_and_gigs_info.gigs.gig_id": payload.service_and_gigs_info.gigs.gig_id
                                                },
                                                {$set: obj}, function (err, result) {
                                                    console.log('gig already present inside service element so update same gig : result : ', result);
                                                    if (err) {
                                                        logger.error("Find failed", err);
                                                        responseFormatter.formatServiceResponse(err, callback);
                                                    } else {
                                                        responseFormatter.formatServiceResponse(result, callback, 'Service and Gig updated successfully in Provider profile', 'success', 200);
                                                    }
                                                })
                                            break;
                                        }
                                    }
                                    break;
                                }   // need not to handle this if coz result will always be having service.

                            }
                            if (!gigFound) {
                                SPProfileSchema.SPProfile.update({
                                        provider_id: payload.provider_id,
                                        "service_and_gigs_info.service_id": payload.service_and_gigs_info.service_id
                                    },
                                    {$push: {"service_and_gigs_info.$.gigs": payload.service_and_gigs_info.gigs}}, function (err, result) {
                                        console.log('gig not found in service element so push gig inside service element : ', result);
                                        if (err) {
                                            logger.error("Find failed", err);
                                            responseFormatter.formatServiceResponse(err, callback);
                                        } else {
                                            if (result.n != 0) {
                                                responseFormatter.formatServiceResponse({}, callback, 'Service and Gig added successfully to Provider profile', 'success', 200);
                                            } else {
                                                responseFormatter.formatServiceResponse({}, callback, 'Service or gig not found in provider profile', 'error', 404);
                                            }
                                        }

                                    });
                            }

                        }

                    }
                });
        }
    })

};

module.exports.addLocationsAndPricingToGig = function (payload, callback) {
    SPGigLocationMappingSchema.SPGigLocationMapper.insertMany(payload.docs, function (err, SPGigLocationMappings) {
        console.log('SPGigLocationMappings  :: ', SPGigLocationMappings);
        if (err) {
            logger.error("Find failed", err);
            responseFormatter.formatServiceResponse(err, callback);
        }
        else {
            callback(null, SPGigLocationMappings)
        }
    });
};


module.exports.updateLocationsAndPricingToGig = function (payload, callback) {
    console.log('payload in updateLocationsAndPricingToGig :: ',payload);

    if(payload.docs && payload.docs.length != 0 && payload.docs[0].provider_id){
        var provider_id = payload.docs[0].provider_id;

        SPGigLocationMappingSchema.SPGigLocationMapper.remove({provider_id : provider_id},function(err,numberRemoved){
            if(err){
                callback(err);
            }else{
                console.log("in updateLocationsAndPricingToGig inside remove call back" + numberRemoved);
                SPGigLocationMappingSchema.SPGigLocationMapper.insertMany(payload.docs, function (err, SPGigLocationMappings) {
                    console.log('SPGigLocationMappings  :: ', SPGigLocationMappings);
                    if (err) {
                        logger.error("Find failed", err);
                        responseFormatter.formatServiceResponse(err, callback);
                    }
                    else {
                        callback(null, SPGigLocationMappings)
                    }
                });
            }
        });

    }




    /*var count = 0;
    for(var i = 0 ; i< payload.docs.length; i++){

        if(payload.docs[i].doc_id){
            const id = mongoose.Types.ObjectId(payload.docs[i].doc_id);
            delete payload.docs[i]["doc_id"];

            SPGigLocationMappingSchema.SPGigLocationMapper.findOneAndUpdate({_id:id},payload.docs[i],{new:true},function(err,data){
                if(err){
                    console.log('Error Occurred findOneAndUpdate in updateLocationsAndPricingToGig : ',err);
                    count++;
                    console.log('in err : count :: ',count);
                }
                else{
                    console.log(" in updateLocationsAndPricingToGig Pricing and Revenue of location for gig updated successfully ------------",data);
                    count++;
                    console.log('in update success : count :: ',count);

                }
            })
        }else{
            SPGigLocationMappingSchema.SPGigLocationMapper.insertOne(payload.docs[i]).then(function(result) {
                    console.log('in updateLocationsAndPricingToGig ---result of insert new location delivery price and revenue for gig :: ',result);
                    count++;
                    console.log('in insert success : count :: ',count);
                })
        }
        console.log('count after iteration ',i," is :: ",count);
    }
    if(count == payload.docs.length){
        callback(null , {"msg" : "All location docs updated succesfully"});
    }else{
        callback(null , {"msg" : "Something went wrong."});
    }*/
};

module.exports.getAllProvidersByGigId = function (service_id, gig_id, latitude, longitude, callback) {

    var nearByProviderByGigId = [{
        $geoNear: {
            near: {type: "Point", coordinates: [longitude, latitude]},
            distanceField: 'dist.calculated',
            maxDistance: 50000,
            query: {
                service_and_gigs_info: {
                    "$elemMatch": {
                        service_id: service_id,
                        "gigs": {
                            "$elemMatch": {gig_id: gig_id}
                        }
                    }
                }
            },
            spherical: true
        }
    }, {
        $sort: {
            dist: 1
        }
    }, {
        $limit: 50
    }, {
        $project: {
            'provider_id': 1,
            'provider_email': 1,
            'first_name': 1,
            'last_name': 1,
            'geometry': 1,
            'ratings': 1,
            'description': 1,
            mode_of_transport:1
        }
    }];


    SPProfileSchema.SPProfile.aggregate(nearByProviderByGigId, function (err, providers) {
        console.log("providers", providers)
        if (err) {
            logger.error("Find failed", err);
            responseFormatter.formatServiceResponse(err, callback);
        }
        else {
            var parallel = [];
            var eta = [];
            var minDistance = [];
            let mode_of_transport=[]
            if (providers && providers.length > 0) {
                for (var i = 0; i < providers.length; i++) {
                    let count = 0
                    count += 1
                    console.log("count", count)
                    console.log("providers[i].geometry", providers[i].geometry)
                    const dataToPush = providers[i].geometry.coordinates[1] + "," + providers[i].geometry.coordinates[0];
                    parallel.push(dataToPush)
                    if(providers[i].mode_of_transport){
                        mode_of_transport.push(providers[i].mode_of_transport)
                    }
                    console.log("dataToPush", dataToPush)
                }
                console.log("parallel", parallel)
                const latlong = latitude + ',' + longitude
                console.log("latlong", latlong)
                var origins = [latlong];
                console.log("origins array", origins)
                var destinations = parallel;
                console.log("destinations>>>>>>", destinations)
               console.log("providers[i].mode_of_transport",mode_of_transport)
                //var ETA = {};
                distance.key('AIzaSyDBPGL4OzGCJ7De1wCRPqsO9cD8w6eOEIA');
                /*if(mode_of_transport.length == 0){
                    mode_of_transport = 'driving';
                }else {
                    distance.mode(mode_of_transport[0]);
                }*/
                //distance.key('AIzaSyBTV_8yxiceJSOdyoFggFzhfzxEexgEtPo');
                distance.mode('driving');
                distance.matrix(origins, destinations, function (err, distances) {
                    if (err) {
                        console.log('error in distance matrix api : ', err);
                        callback(err);
                    }
                    else {
                        if (distances.error_message) {
                            console.log('Google api failed to find distances : Response is not eta filtered :::::');
                            responseFormatter.formatServiceResponse({providers: providers}, callback, "Providers Fetched Successfully", "success", 200);
                            //ETA = providers;
                        }
                        else {
                            console.log("distances", distances);
                            var elements = distances.rows[0].elements;
                            console.log('elements :::: ',elements);
                            //var eta=distances.rows[0].elements;
                            for (var j = 0; j < elements.length; j++) {
                                console.log("elements[j].duration", elements[j].duration.value)
                                eta.push(elements[j].duration.value);
                                minDistance.push(elements[j].distance.value);
                            }
                            console.log("eta:", eta);
                            var min = eta[0];
                            var minIndex = 0;

                            for (var i = 1; i < eta.length; i++) {
                                if (eta[i] < min) {
                                    minIndex = i - 1;
                                    min = eta[i];
                                }
                            }
                            var minDis = minDistance[0];
                            var minDistanceIndex = 0;

                            for (var i = 1; i < minDistance.length; i++) {
                                if (minDistance[i] < minDis) {
                                    minDistanceIndex = i - 1;
                                    minDis = minDistance[i];
                                }
                            }
                            console.log("min & index:", minIndex, min)
                            //providers.splice=(index,0,parallel);
                            //console.log("providers[index]",providers[index])

                            //providers[minIndex].eta=min;
                            var ETA = {"eta": (min / 60), "minDistance": (minDis / 1000), providers}
                            responseFormatter.formatServiceResponse(ETA, callback, "min eta added.", "success", 200);
                        }
                    }
                })
            }
            else {
                responseFormatter.formatServiceResponse({providers: []}, callback, "No providers Found.", "error", 404);
            }
        }
    });
};


var isBookingAcceptedBySP = function (bookingID, callback) {
    const id = mongoose.Types.ObjectId(bookingID);
    bookingSchema.Booking.findOne({_id: id, is_accepted: true}, function (err, booking) {
        console.log('Booking details returned----------------', booking);
        if (err) {
            logger.error("Find failed", err);
            responseFormatter.formatServiceResponse(err, callback, 'Error Occurred Please Try After Some Time', 'error', 500);
        }
        else {
            console.log("is bookingAccepted>>> booking", booking)

            if (!booking) {
                callback(null, false);
                //responseFormatter.formatServiceResponse({}, callback ,'service provider is busy at this moment please try again later','success',200);
            }
            else {
                callback(null, booking);
            }
            //if(booking){
            //    responseFormatter.formatServiceResponse(booking, callback ,'booking already accepted by one of the SP','success',200);
            //   // callback(null,booking)
            //}
            //  else{
            //    responseFormatter.formatServiceResponse({}, callback ,'No Providers Found Nearby Please Try After Some Time','error',404);
            //   // callback(null,{})
            //}
        }
    });
}



var findEtaWieghtage = function(etaFilter,etaSlabs){

    for(var i =0; i< etaSlabs.eta_priority_ranges.length; i++){
        for(var j = 0 ; j< etaFilter.length; j++){
            if ((i == 0) && (etaFilter[j].eta) / 60 >= etaSlabs.eta_priority_ranges[i].min &&
                (etaFilter[j].eta) / 60 < etaSlabs.eta_priority_ranges[i].max) {
                console.log('etaSlabs.eta_priority_ranges[i].min : ',etaSlabs.eta_priority_ranges[i].min,'   etaSlabs.eta_priority_ranges[i].max : ',etaSlabs.eta_priority_ranges[i].max,'  etaFilter[j].eta : ',(etaFilter[j].eta)/60);

                console.log('in 1st Slab');
                etaFilter[j].weight = etaSlabs.eta_priority_ranges[i].weight;
            }else if((i == 1) && (etaFilter[j].eta) / 60 >= etaSlabs.eta_priority_ranges[i].min &&
                (etaFilter[j].eta) / 60 < etaSlabs.eta_priority_ranges[i].max){
                console.log('etaSlabs.eta_priority_ranges[i].min : ',etaSlabs.eta_priority_ranges[i].min,'   etaSlabs.eta_priority_ranges[i].max : ',etaSlabs.eta_priority_ranges[i].max,'  etaFilter[j].eta : ',(etaFilter[j].eta)/60);

                console.log('in 2nd Slab');
                etaFilter[j].weight = etaSlabs.eta_priority_ranges[i].weight;
            }else if((i == 2) && (etaFilter[j].eta) / 60 >= etaSlabs.eta_priority_ranges[i].min &&
                (etaFilter[j].eta) / 60 < etaSlabs.eta_priority_ranges[i].max){
                console.log('etaSlabs.eta_priority_ranges[i].min : ',etaSlabs.eta_priority_ranges[i].min,'   etaSlabs.eta_priority_ranges[i].max : ',etaSlabs.eta_priority_ranges[i].max,'  etaFilter[j].eta : ',(etaFilter[j].eta)/60);

                console.log('in 3th Slab');
                etaFilter[j].weight = etaSlabs.eta_priority_ranges[i].weight;
            }else if((i == 3) && (etaFilter[j].eta) / 60 >= etaSlabs.eta_priority_ranges[i].min &&
                (etaFilter[j].eta) / 60 < etaSlabs.eta_priority_ranges[i].max){
                console.log('etaSlabs.eta_priority_ranges[i].min : ',etaSlabs.eta_priority_ranges[i].min,'   etaSlabs.eta_priority_ranges[i].max : ',etaSlabs.eta_priority_ranges[i].max,'  etaFilter[j].eta : ',(etaFilter[j].eta)/60);

                console.log('in 4th Slab');
                etaFilter[j].weight = etaSlabs.eta_priority_ranges[i].weight;
            }else if((i == 4) && (etaFilter[j].eta) / 60 >= etaSlabs.eta_priority_ranges[i].min &&
                (etaFilter[j].eta) / 60 < etaSlabs.eta_priority_ranges[i].max){
                console.log('etaSlabs.eta_priority_ranges[i].min : ',etaSlabs.eta_priority_ranges[i].min,'   etaSlabs.eta_priority_ranges[i].max : ',etaSlabs.eta_priority_ranges[i].max,'  etaFilter[j].eta : ',(etaFilter[j].eta)/60);

                console.log('in 5th Slab');
                etaFilter[j].weight = etaSlabs.eta_priority_ranges[i].weight;
            }else if((i == 5) && (etaFilter[j].eta) / 60 >= etaSlabs.eta_priority_ranges[i].min &&
                (etaFilter[j].eta) / 60 < etaSlabs.eta_priority_ranges[i].max){
                console.log('etaSlabs.eta_priority_ranges[i].min : ',etaSlabs.eta_priority_ranges[i].min,'   etaSlabs.eta_priority_ranges[i].max : ',etaSlabs.eta_priority_ranges[i].max,'  etaFilter[j].eta : ',(etaFilter[j].eta)/60);

                console.log('in 6th Slab');
                etaFilter[j].weight = etaSlabs.eta_priority_ranges[i].weight;
            }
        }
    }
    return etaFilter;

}


var findRatingWieghtage = function(etaFilter , ratingSlabs){


    var avgRating = 0;
    var maxRating = 5;

        for(var i = 0 ; i< etaFilter.length; i++){
            var sumOfRatings = 0;
            if (etaFilter[i].ratings && etaFilter[i].ratings.length != 0) {
                console.log('ratings available');
                for(var j = 0 ; j < etaFilter[i].ratings.length ; j++ ){
                    console.log("etaFilter[i].ratings[j] :: ",etaFilter[i].ratings[j]);
                    sumOfRatings += Number(etaFilter[i].ratings[j]);

                }
                console.log('sumOfRatings  :  ',sumOfRatings)
                avgRating = sumOfRatings / etaFilter[i].ratings.length;
                console.log('avgRating for :: ',etaFilter[i].first_name,"   is  :: ", avgRating);

                if(etaFilter[i].weight){
                    etaFilter[i].weight += (Number(avgRating)/Number(maxRating))* Number(ratingSlabs.total_weight);

                    console.log('Totaal Weight  ' ,Number(ratingSlabs.total_weight));
                }
                else {
                    etaFilter[i].weight = (Number(avgRating)/Number(maxRating))*Number(ratingSlabs.total_weight);
                }

            }else {
                console.log("rating not available for etaFilter[i].ratings[j] :: 5 is picked deafut case");
                if(etaFilter[i].weight){
                    etaFilter[i].weight+=5;
                }
                else {
                    etaFilter[i].weight = 5;
                }
            }
        }

    return etaFilter;

}

var findSkillWieghtage = function(etaFilter , gig_id, service_id , skillSlabs){

    for(var i = 0 ; i< etaFilter.length; i++) {
        for (var j = 0; j < etaFilter[i].service_and_gigs_info.length; j++) {
            for (var k = 0; k < etaFilter[i].service_and_gigs_info[j].gigs.length; k++) {

                console.log('etaFilter[i].service_and_gigs_info.gigs', etaFilter[i].service_and_gigs_info[j].gigs[k]);

                if(etaFilter[i].service_and_gigs_info[j].gigs[k].gig_id == gig_id){
                    console.log('etaFilter[i].service_and_gigs_info[j].gigs[k].level',etaFilter[i].service_and_gigs_info[j].gigs[k].level[0]);


                    for(var z = 0; z < skillSlabs.skill_priority_ranges.length; z++){
                        if(etaFilter[i].service_and_gigs_info[j].gigs[k].level[0] == skillSlabs.skill_priority_ranges[z].name){
                            console.log('skill name matched :: ');
                            if(etaFilter[i].weight){
                                etaFilter[i].weight += skillSlabs.skill_priority_ranges[z].weight;
                            }
                            else {
                                etaFilter[i].weight = skillSlabs.skill_priority_ranges[z].weight;
                            }
                        }
                    }

                }
            }
        }console.log("************************ Chak De***************************",etaFilter[i].weight);
    }

    return etaFilter;

}


var findJobAcceptanceWieghtage = function(etaFilter , jobAcceptanceSlabs){



    for(var i = 0 ; i< etaFilter.length; i++){
        var acceptancePercentage = 0;

        if(etaFilter[i].acceptance_count && etaFilter[i].rejectance_count && (etaFilter[i].acceptance_count + etaFilter[i].rejectance_count)!=0) {
            acceptancePercentage = Number(etaFilter[i].acceptance_count)*100/(Number(etaFilter[i].acceptance_count) + Number(etaFilter[i].rejectance_count));
            console.log('acceptancePercentage for :: ',etaFilter[i].first_name,"   is  :: ", acceptancePercentage);

            if(etaFilter[i].weight){
                etaFilter[i].weight += (acceptancePercentage/100)*Number(jobAcceptanceSlabs.total_weight);
            }
            else {
                etaFilter[i].weight = (acceptancePercentage/100)*Number(jobAcceptanceSlabs.total_weight);
            }
        }
    else {
        console.log("Not accepted and Rejected any requests :: 5 is picked deafut case");
        if(etaFilter[i].weight){
            etaFilter[i].weight+=5;
        }
        else {
            etaFilter[i].weight = 5;
        }
    }
}

    return etaFilter;

}

var findPriceWeightage = function (etaFilter, gig_id, locationId , totalWeight, callback) {
    console.log('in findPriceWeightage :: etaFilter :, gig_id :, locationId :, totalWeight :',etaFilter, gig_id, locationId , totalWeight);
    const parallelF = [];
    etaFilter.forEach(function (result) {
        console.log('result.provider_id :: ', result.provider_id);
        parallelF.push(function (cbb) {

            async.waterfall([
                function (cb) {
                    gigsSchema.Gigs.findOne({gig_id: gig_id}, {
                        gig_id: 1,
                        pricing:1,
                        number_of_hours:1
                    }, {lean: true}, function (err, data) {
                        if (err) {
                            cb(err)
                        }
                        else {
                            console.log("gigData =", data);
                            cb(null , data);
                        }
                    })
                },
                function (gigPriceInfo, cb) {
                    console.log('in waterfall gigPriceInfo  :: ',gigPriceInfo);
                    SPGigLocationMapperSchema.SPGigLocationMapper.findOne({
                        provider_id: result.provider_id,
                        'location.locationID': locationId
                    }, { pricing: 1, min_hourly_amount: 1, _id: 0}, {lean: true}, function (err, data) {
                        console.log('in findPriceWeightage err-----', err, 'pricing data initial------- ', data);
                        if (err) {
                            cbb(err, null)
                        }
                        else {
                            if (data && data.pricing) {
                                var priceArray = [];
                                var fixedPrice = 0;
                                var hourlyPrice = 0;
                                var fixedMedianPrice = 0;
                                var hourlyMedianPrice = 0;
                                var fixedWt = 0;
                                var hourlyWt = 0;
                                for (var i = 0; i < data.pricing.length; i++) {
                                    if (data.pricing[i].type == 'fixed') {
                                        fixedPrice = data.pricing[i].value ;
                                        console.log('in findPriceWeightage priceArray fixed  : ', fixedPrice);
                                    }
                                    if (data.pricing[i].type == 'hourly') {
                                        hourlyPrice = data.pricing[i].value * 1;
                                        console.log('in findPriceWeightage priceArray hourly : ', hourlyPrice);
                                    }
                                }

                                for(var i = 0; i< gigPriceInfo.pricing.length; i++){
                                    if (gigPriceInfo.pricing[i].type == 'fixed') {
                                        fixedMedianPrice = gigPriceInfo.pricing[i].median ? Number(gigPriceInfo.pricing[i].median) : 0;
                                        console.log('in findPriceWeightage priceArray fixed  : ', fixedMedianPrice);

                                    }
                                    if (gigPriceInfo.pricing[i].type == 'hourly') {
                                        hourlyMedianPrice = gigPriceInfo.pricing[i].median ? Number(gigPriceInfo.pricing[i].median) * 1 : 0;
                                        console.log('in findPriceWeightage priceArray hourly : ', hourlyMedianPrice);
                                    }
                                }
                                var priceVariance = [1-((Number(fixedPrice) - Number(fixedMedianPrice))/Number(fixedMedianPrice))];
                                if(priceVariance < 0)
                                {
                                    priceVariance = 0;
                                }
                                fixedWt = Number(priceVariance) * Number(totalWeight);

                                var hourlyVariance = [1-((Number(hourlyPrice) - Number(hourlyMedianPrice))/Number(hourlyMedianPrice))];
                                if(hourlyVariance < 0)
                                {
                                    hourlyVariance = 0;
                                }
                                hourlyWt = hourlyVariance * Number(totalWeight);

                                var avgWt=(Number(fixedWt) + Number(hourlyWt))/2;

                                if(result.weight){
                                    result.weight += avgWt ;
                                }
                                else {
                                    result.weight = avgWt;
                                }

                                cbb(null, result);
                            } else {
                                if(result.weight){
                                    result.weight += 0;
                                }
                                else {
                                    result.weight = 0;
                                }
                                cbb(null, result);
                            }

                        }
                    }).sort({_id: -1}).limit(1)
                }
            ], function (err, data) {
                console.log("sbse final", err, data);
                if (err) {
                    console.log("err+++++++", err)
                }
                else {
                    console.log("data+++++++", data)
                }
            })

        })
    });

    console.log("paralleF", parallelF);

    async.parallel(parallelF, function (err, data) {
        console.log('error data : ------', err, data);
        if (err) {
            console.log('error : ', err);
            return callback(err);
        }
        else {
            console.log("in findPriceWeightage final", data)
            callback(err , data);
        }
    });


}

function addZero(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}




module.exports.filterProviders = function (payload, callback) {

    let filters = {
        latitude: payload.location.latitude,
        longitude: payload.location.longitude,
        service_id: payload.service_id,
        gig_id: payload.gig_id,
        eta_min_val: payload.eta.min_val,
        eta_max_val: payload.eta.max_val,
        tool_flag: [payload.tools],
        SP_level_array: payload.SP_level,
        supplies: [payload.supplies]
    };

    if (!payload.tools || payload.tools == false) {
        filters.tool_flag = [true, false]
    }
    if (!payload.supplies || payload.supplies == false) {
        filters.supplies = [true, false]
    }

    let gigs = {
        "$elemMatch": {
            gig_id: filters.gig_id,
            tools: {$in: filters.tool_flag},
            supplies: {$in: filters.supplies},
            level: {$in: filters.SP_level_array}
        }
    };


    // let gig_specific_param_element_query = {};
    if (payload.attributes && payload.attributes.length > 0) {
        console.log("condition only when gsp screen has params")
        for (var i = 0; i < payload.attributes.length; i++) {
            var jsonObjectKey = "gig_specific_param." + payload.attributes[i].key;
            console.log('jsonObjectKey   ::: ', jsonObjectKey);
            gigs["$elemMatch"][jsonObjectKey] = {$in: payload.attributes[i].value};
            if (payload.attributes[i].type == 'slider') {
                console.log('payload.attributes[i].value[1] ::: ', payload.attributes[i].value[1]);
                gigs["$elemMatch"][jsonObjectKey] = {
                    $elemMatch: {
                        $gte: parseInt(payload.attributes[i].value[0]),
                        $lte: parseInt(payload.attributes[i].value[1])
                    }
                };
            }
        }
    }

    console.log('filters : ', filters);
    console.log("gigs filter", gigs)

    //console.log('gig_specific_param_element_query : ', gig_specific_param_element_query);

    adminGlobalDataSchema.AdminGlobalData.findOne({}, {}, {lean: true}, function (err, adminGolbalData) {
     if (err) {
        console.log('error in addGlobalData :: ', err);
        responseFormatter.formatServiceResponse(err, callback);
     }
     else {
        console.log('result from AdminGlobalData before filtering SP : result : ', adminGolbalData);
        var SPProviderByFilters = [{
        $geoNear: {
            near: {type: "Point", coordinates: [filters.longitude, filters.latitude]},
            distanceField: 'dist.calculated',
            maxDistance: adminGolbalData.filter_radius ? Number(adminGolbalData.filter_radius)*1000 : 50000,
            query: {
                service_and_gigs_info: {
                    "$elemMatch": {
                        service_id: filters.service_id,
                        gigs: gigs,
                        //'gigs.booking_type': {$elemMatch: {$eq: payload.booking_type}}
                    }
                }
            },

            spherical: true
        }
    }, {
        $sort: {
            dist: 1
        }
    }, {
        $limit: 50
    }, {
        $project: {
            'provider_id': 1,
            'provider_email': 1,
            'first_name': 1,
            'last_name': 1,
            'geometry': 1,
            'ratings': 1,
            'acceptance_count': 1,
            'rejectance_count': 1,
            'description': 1,
            'service_and_gigs_info.gigs': 1,
            'average_rating': 1,
            'is_available':1,
            'insurance':1,
            'gender' :1,
            'i_can_travel':1,
            'discount':1,
            'reviews':1

        }
    },
        {
            $lookup: {
                from: "SPtimeslots",
                localField: "provider_id",
                foreignField: "provider_id",
                as: "slotData"
            }
        },
        {
            $project: {
                'provider_id': 1,
                'provider_email': 1,
                'first_name': 1,
                'last_name': 1,
                'geometry': 1,
                'ratings': 1,
                'acceptance_count': 1,
                'rejectance_count': 1,
                'description': 1,
                'mode_of_transport': 1,
                'service_and_gigs_info.gigs': 1,
                'slotData': {'$filter': {
                    input: '$slotData',
                    as: 'slotsArray',
                    cond: {
                    "$eq": ["$$slotsArray.gig_id", filters.gig_id]
                 }
            }},
                'average_rating': 1,
                'is_available':1,
                'insurance':1,
                'gender' :1,
                'i_can_travel':1,
                'discount':1,
                'reviews':1
            }
        }

    ];

    console.log('*******', JSON.stringify(SPProviderByFilters[0]['$geoNear']));
    let user = {
        seeker_id: payload.seeker_id,
        seeker_name: payload.seeker_name,
        seeker_device_token: payload.seeker_device_token,
        seeker_device_type: payload.seeker_device_type,
        is_seeker_location: payload.is_seeker_location,
        booking_address: payload.booking_address,
        booking_latitude: payload.booking_latitude,
        booking_longitude: payload.booking_longitude,
        booking_address1: payload.booking_address1,
        booking_latitude1: payload.booking_latitude1,
        booking_longitude1: payload.booking_longitude1,
        ODS_type: payload.ODS_type,
        gig_id: payload.gig_id,
        service_id: payload.service_id,
        tools: payload.tools,
        supplies: payload.supplies,
        description: payload.description,
        unit: payload.unit,
        quantity: payload.quantity,
        virtual_address: payload.virtual_address,
        is_product_based: payload.is_product_based,
        level: payload.SP_level
    }
    SPProfileSchema.SPProfile.aggregate(SPProviderByFilters, function (err, providers) {
        console.log("providers are:", providers);

        if (err) {
            logger.error("Find failed", err);
            responseFormatter.formatServiceResponse(err, callback);
        }
        else {
            if (providers && providers.length == 0) {
                console.log("no providers found", providers.length)
                responseFormatter.formatServiceResponse(providers, callback, "No providers Found.", "error", 404);
            }

            else {

                //responseFormatter.formatServiceResponse(providers, callback, "Temperory providers Found.", "success", 200);
                // Now filter those providers whose availabilty is on
                var unavailableProviders = [];
                for (var i = 0; i < providers.length; i++) {
                    if (providers[i].is_available) {
                        console.log('provider is available :: name :', providers[i].first_name, "  is_available : ", providers[i].is_available);
                    } else {
                        unavailableProviders.push(providers[i]);
                        providers.splice(i, 1);
                    }
                }
                // This block will be executing in async manner to send push in parallel process.
                sendPushToUnavailableProviders(unavailableProviders, function (err, pushResult) {
                    if (err) {
                        console.log('sending notification to unavailable providers failed');
                    } else {
                        console.log('sending notification to unavailable providers successfull -- result ', pushResult);
                    }
                });

                if(providers.length == 0){
                    console.log('No Providers are available now. Please try sone other time.We will notify all unavailable providers about this booking request.');
                    return responseFormatter.formatServiceResponse(providers, callback, "No Providers are available now. Please try sone other time.", "error", 404);
                }

                var etaFilter = [];
                var i_can_travel_filter = [];
                var parallel = [];
                var eta = [];
                var distancesArray = [];
                var providerTemp = [];
                var providerTempIndex = 0;
                if (providers && providers.length > 0) {


                    if(payload.booking_type == 'SCH'){

                        var dayList = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

                        console.log('In SCH payload.sch_booking_date : ',payload.sch_booking_date);
                        var booking_date = new Date(payload.sch_booking_date);
                        var booking_day = booking_date.getDay();
                        var current_day = dayList[booking_day];

                        var booking_slot = payload.sch_booking_slot;
                        console.log('In SCH payload.sch_booking_slot : ',payload.sch_booking_slot);
                        var current_slot = Number(booking_slot);
                        console.log('In SCH current_slot : ',current_slot);

                        // For now , current time slot used , Ask Nandan for time slot in SCH booking type
                        /*if (payload.time_offset) {
                            current_slot = Number((new Date().getHours().toString()) +
                                ((new Date().getMinutes()) >= 10 ? new Date().getMinutes().toString() : '0' + new Date().getMinutes().toString()));
                            current_slot = current_slot + Number(payload.time_offset);
                            console.log("current slot", Number(new Date().getHours().toString() + ((new Date().getMinutes()) > 10 ? new Date().getMinutes().toString() : '0' + new Date().getMinutes().toString())), Number(payload.time_offset))
                        }
                        else {
                            current_slot = Number(new Date().getHours().toString() + new Date().getMinutes().toString()) + Number(530);
                        }
*/
                    }else{

                        var today = new Date();
                        var day = today.getDay();
                        var dayList = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
                        var current_day = dayList[day];
                        var current_slot;
                        console.log(new Date().getHours().toString());
                        console.log(new Date().getMinutes().toString());
                        console.log('0+new Date().getMinutes().toString() :: ', '0' + new Date().getMinutes().toString());
                        console.log("payload time offset", payload.time_offset);
                        if (payload.time_offset) {
                            current_slot = Number((new Date().getHours().toString()) +
                                ((new Date().getMinutes()) >= 10 ? new Date().getMinutes().toString() : '0' + new Date().getMinutes().toString()));
                            current_slot = current_slot + Number(payload.time_offset);
                            console.log("current slot", Number(new Date().getHours().toString() + ((new Date().getMinutes()) > 10 ? new Date().getMinutes().toString() : '0' + new Date().getMinutes().toString())), Number(payload.time_offset))
                        }
                        else {
                            current_slot = Number(new Date().getHours().toString() + new Date().getMinutes().toString()) + Number(530);
                        }
                    }
                    //Number(today.getHours().toString()+today.getMinutes().toString());  //1500;//Number(addZero(today.getHours())+addZero(today.getMinutes()));

                    console.log("Current Day :: ", current_day, "  Current slot :: ", current_slot);
                    for (var i = 0; i < providers.length; i++) {
                        // Now filter the already filtered providers on current day and time slots.
                        console.log('providers.name :: index i ',i," ---> ",providers[i].first_name);
                        if (providers[i].slotData && providers[i].slotData.length != 0 && providers[i].slotData[0].slots && providers[i].slotData[0].slots.length != 0) {
                            console.log('provider[i].timeSlots :::: ', providers[i].slotData[0].slots);
                            for (var j = 0; j < providers[i].slotData[0].slots.length; j++) {
                            console.log("Time Slot log :::",providers[i].slotData[0].slots[j].day ,"     ",current_day );
                            console.log("Time Slot log 2 :::",Number(providers[i].slotData[0].slots[j].start_time) ,"   ",current_slot,"     ",Number(providers[i].slotData[0].slots[j].end_time));
                                if (providers[i].slotData[0].slots[j].day == current_day && Number(providers[i].slotData[0].slots[j].start_time) <= Number(current_slot) &&
                                    Number(providers[i].slotData[0].slots[j].end_time) >= Number(current_slot)) {
                                    console.log('provider slot matched.');
                                    providerTemp[providerTempIndex] = providers[i];
                                    const dataToPush = providerTemp[providerTempIndex].geometry.coordinates[1] + "," + providerTemp[providerTempIndex].geometry.coordinates[0];
                                    parallel.push(dataToPush);
                                    providerTempIndex++;
                                    console.log('providerTemp :: ', providerTemp);
                                    console.log('parallel :: ', parallel);
                                    break;
                                }

                            }

                        }
                    }
                    if (providerTemp.length == 0) {
                        console.log('No providers found after filtering with current slot and current day : ');
                        //providerTemp = providers;
                        return responseFormatter.formatServiceResponse(providerTemp, callback, "No providers found after filtering with current slot and current day", "error", 404);
                    }

                    const latlong = user.booking_latitude + ',' + user.booking_longitude
                    var origins = [latlong];
                    console.log("latlong:", latlong);

                    var destinations = parallel;
                    distance.key('AIzaSyDBPGL4OzGCJ7De1wCRPqsO9cD8w6eOEIA');
                    if (providerTemp.mode_of_transport) {
                        distance.mode(providerTemp.mode_of_transport);
                    }
                    //distance.key('AIzaSyBTV_8yxiceJSOdyoFggFzhfzxEexgEtPo');
                    distance.matrix(origins, destinations, function (err, distances) {
                        console.log('distances:', distances);
                        if (err) {
                            callback(err);
                        }
                        else {
                            if (distances.error_message) {
                                console.log('Google api failed to find distances : Response is not eta filtered :::::');
                                etaFilter = providerTemp;
                            }
                            else {
                                var elements = distances.rows[0].elements;
                                console.log("elements:", elements);
                                for (var j = 0; j < elements.length; j++) {
                                    console.log("elements[j].duration", elements[j].duration)
                                    eta.push(elements[j].duration.value);
                                    distancesArray.push(elements[j].distance.value);
                                }
                                console.log('eta ::::: ', eta, "  distances :::: ",distancesArray);
                                for (var k = 0; k < providerTemp.length; k++) {
                                    providerTemp[k].eta = eta[k];
                                    providerTemp[k].distance_from_current_booking = distancesArray[k];
                                }

                                console.log('eta and distances punched to providers  :: ', providerTemp);
                                // Now filter with eta min and max value
                                for (var z = 0; z < providerTemp.length; z++) {
                                    if (providerTemp[z].eta >= filters.eta_min_val && providerTemp[z].eta <= filters.eta_max_val) {
                                        etaFilter.push(providerTemp[z]);
                                    }
                                }
                                console.log('without i_can_travel filtered providers  :', etaFilter);
                                //Now filter with i_can_travel param
                                for (var z = 0; z < etaFilter.length; z++) {
                                    if ( Number(etaFilter[z].i_can_travel) >= Number(etaFilter[z].eta) ) {
                                        i_can_travel_filter.push(etaFilter[z]);
                                    }
                                }
                                // now make etafiltered data equals to i_can_travel filtered data
                                etaFilter = i_can_travel_filter;
                                etaFilter.sort(function (a, b) {
                                    return parseFloat(a.eta) - parseFloat(b.eta);
                                });
                                console.log('sorted etaFilter : ', etaFilter);
                                if (etaFilter.length == 0) {
                                    console.log("No Provider present in min and max range of ETA..............");
                                    return responseFormatter.formatServiceResponse(providerTemp, callback, "No Provider present in min and max range of ETA", "error", 404);
                                }

                            }
                            if (payload.ODS_type == "System Select") {
                                var self = this;
                                //console.log("inside System Select filtered providers:", etaFilter);
                                adminGlobalDataSchema.AdminGlobalData.findOne({}, {}, {lean: true}, function (err, adminGolbalData) {
                                    if (err) {
                                        console.log('error in addGlobalData :: ', err);
                                        responseFormatter.formatServiceResponse(err, callback);
                                    }
                                    else {
                                        console.log("in filter api AdminGlobalData for finding wieghtage  data :: ", adminGolbalData);
                                        if (adminGolbalData.eta && adminGolbalData.eta.is_active) {
                                            etaFilter = findEtaWieghtage(etaFilter, adminGolbalData.eta);
                                            console.log('without sorted weightage ETA filtered Provider  ::::::', etaFilter);
                                        }
                                        if (adminGolbalData.skill_level && adminGolbalData.skill_level.is_active) {
                                            etaFilter = findSkillWieghtage(etaFilter, user.gig_id, user.service_id, adminGolbalData.skill_level);
                                            console.log('without sorted weightage skill filtered Provider  ::::::', etaFilter);
                                        }
                                        if (adminGolbalData.rating && adminGolbalData.rating.is_active) {
                                            etaFilter = findRatingWieghtage(etaFilter, adminGolbalData.rating);
                                            console.log('without sorted weightage Rating filtered Provider  ::::::', etaFilter);
                                        }
                                        if (adminGolbalData.job_acceptance && adminGolbalData.job_acceptance.is_active) {
                                            etaFilter = findJobAcceptanceWieghtage(etaFilter, adminGolbalData.job_acceptance);
                                            console.log('without sorted weightage Job Acceptance filtered Provider  ::::::', etaFilter);
                                        }
                                        //if(adminGolbalData.price && adminGolbalData.price.is_active)

                                        var locationData = {};
                                        async.waterfall([
                                            function (cb) {
                                                geocoder.reverseGeocode(payload.location.latitude, payload.location.longitude, function (err, data) {
                                                    if (err) {
                                                        cb(err);
                                                    }
                                                    else {
                                                        console.log("location Data", data.results[0].address_components);
                                                        var addressData = data.results[0].address_components;
                                                        addressData.forEach(function (val, index) {

                                                            if (val.types[0] == "administrative_area_level_1") {

                                                                locationData.locationShort = val.short_name;

                                                            }
                                                            if (val.types[0] == "country") {

                                                                locationData.countryName = val.short_name;

                                                            }

                                                        });
                                                        console.log('===>', locationData);
                                                        cb(null, locationData);
                                                    }
                                                });
                                            },
                                            function (locationData, cb) {
                                                stateCodesSchema.CodeSchema.findOne({
                                                    code: locationData.locationShort,
                                                    country: locationData.countryName
                                                }, {}, {lean: true}, function (err, location) {
                                                    console.log('Location Found in our Database-----------', location);
                                                    if (err) {
                                                        cb(err)
                                                    }
                                                    else {
                                                        cb(null, location);
                                                    }
                                                })
                                            }
                                        ], function (err, locationData) {
                                            console.log('data in final async waterfall getting location Id : ', locationData);
                                            if (err) {
                                                callback(err)
                                            }
                                            else {
                                                findPriceWeightage(etaFilter, user.gig_id, locationData._id, adminGolbalData.price.total_weight, function (err, etaFilter) {
                                                    if (err) {
                                                        console.log('error in findPriceWeightage :: ', err);
                                                        responseFormatter.formatServiceResponse(err, callback);
                                                    } else {
                                                        console.log('without sorted weightage price filtered Provider  ::::::', etaFilter);

                                                        etaFilter.sort(function (a, b) {
                                                            return parseFloat(b.weight) - parseFloat(a.weight);
                                                        });
                                                        console.log('sorted on weightage Provider  :::::::', etaFilter);
                                                        var waitingTImeInMinutes = 2;
                                                        var etaBasedSortedArray = [];
                                                        var sortedByPrice, sortedBySkill, sortedByRating, sortedByJobAcceptance;
                                                        var sortByPrice, sortBySkill, sortByRating, sortByJobAcceptance;
                                                        var waitUpto = Number(new Date().getTime()) + Number(2 * 60 * 60 * 10);
                                                        var now = 0;
                                                        var timeToWaitInMinutes = 1;
                                                        var c = [];
                                                        async.waterfall([
                                                            function (cb) {
                                                                createBookingForSystemSelect(user, function (err, bookingData) {
                                                                    if (err) {
                                                                        cb(err);
                                                                    } else {
                                                                        console.log('in System select waterfall booking created....');
                                                                        c.push(bookingData);
                                                                        cb(null, bookingData);
                                                                    }
                                                                })
                                                            },
                                                            function (bookingData, cb) {
                                                                console.log('bookingData got in waterfall 2nd stage:: ', bookingData);
                                                                //console.log('data.eta.eta_priority_ranges :: ', data.eta.eta_priority_ranges[i]);
                                                                for (var j = 0; j < etaFilter.length; j++) {
                                                                    (function (b) {
                                                                        var execAt = timeToWaitInMinutes * b * 60 * 1e3;
                                                                        setTimeout(function () {

                                                                            console.log('etaFilter[j]', etaFilter[b].first_name, "------", etaFilter[b].eta / 60);
                                                                            console.log('---     In Wait Time -------');
                                                                            console.log("-------------------", b);

                                                                            now = new Date().getTime();
                                                                            if (now > waitUpto) {
                                                                                console.log('current time ',now," and waitUpto Time : ",waitUpto);
                                                                                console.log('Booking Failed. Time Over......')
                                                                                //mark booking as failed
                                                                            } else {
                                                                                isBookingAcceptedBySP(bookingData._id, function (err, bookingFound) {
                                                                                    if (err) {
                                                                                        console.log('Error occurred :::: inSPprofileModel systemselect : ');
                                                                                        // cb(err);
                                                                                    } else {
                                                                                        if (!bookingFound) {
                                                                                            //sendpush to next SP
                                                                                            notifySPForSystemSelect(etaFilter[b], user, bookingData, function (err, result) {
                                                                                                // cb(null, result);
                                                                                            });
                                                                                        } else {
                                                                                            console.log('Booking accepted by SP. So stop sending push and send response');
                                                                                            // cb(null, bookingFound);
                                                                                        }

                                                                                    }
                                                                                });

                                                                            } // End Else
                                                                            //}// End IF
                                                                            console.log("************************************************* After Time out**********************************");

                                                                        }, execAt)   // setTimeOut end
                                                                    })(j);
                                                                }//End For Loop
                                                                return cb(null);
                                                            } // waterfall 2nd function ends
                                                        ], function (err, systemSelectResult) {
                                                            console.log('data in final async series getting location Id : ', systemSelectResult, "   err :: ", err);
                                                            if (err) {
                                                                callback(err)
                                                            }
                                                            else {
                                                                callback(null, c);
                                                                //responseFormatter.formatServiceResponse(systemSelectResult, callback, '', 'success', 200);
                                                            }
                                                        })
                                                    }
                                                })
                                            }
                                        });

                                    }// admin global data else completed
                                }); // admin global data callback result

                            } // SYSTEM SELECT END

                            else if (payload.ODS_type == 'Seeker Select') {

                                // check is_available flag and filter provider array into two parts


                                var locationData = {};
                                async.waterfall([
                                    function (cb) {
                                        geocoder.reverseGeocode(payload.location.latitude, payload.location.longitude, function (err, data) {
                                            if (err) {
                                                cb(err);
                                            }
                                            else {
                                                // By Chandan Sharma
                                                console.log("location Data", data.results[0].address_components);
                                                var addressData = data.results[0].address_components;
                                                addressData.forEach(function (val, index) {

                                                    if (val.types[0] == "administrative_area_level_1") {

                                                        locationData.locationShort = val.short_name;

                                                    }
                                                    if (val.types[0] == "country") {

                                                        locationData.countryName = val.short_name;

                                                    }

                                                });
                                                console.log('===>', locationData);
                                                cb(null, locationData);
                                            }
                                        });
                                    },
                                    function (locationData, cb) {
                                        stateCodesSchema.CodeSchema.findOne({
                                            code: locationData.locationShort,
                                            country: locationData.countryName
                                        }, {}, {lean: true}, function (err, location) {
                                            console.log('-----------', location);
                                            if (err) {
                                                cb(err)
                                            }
                                            else {
                                                cb(null, location);
                                            }
                                        })
                                    }
                                ], function (err, data) {
                                    console.log('data in final async series getting location Id : ', data);
                                    if (err) {
                                        callback(err)
                                    }
                                    else {
                                        if (!data) {
                                            seekerSelect(etaFilter, payload.quantity, null, function (result) {
                                                //if (result) {
                                                    //responseFormatter.formatServiceResponse(result, callback ,'SP list fetched successfully','success',200);
                                                    callback(null, result);
                                                //}
                                            })
                                        } else {
                                            seekerSelect(etaFilter, payload.quantity, data._id, function (result) {
                                                //if (result) {
                                                    // responseFormatter.formatServiceResponse(result, callback ,'SP list fetched successfully','success',200);
                                                    callback(null, result);
                                                //}
                                            })
                                        }
                                    }
                                })

                            }
                            else if (payload.ODS_type == 'Reverse Bid') {
                                reverseBid(etaFilter, user, payload.bid_amount, function (err, result) {
                                    console.log("result Reverse Bid", result)
                                    if (result) {
                                        console.log("data._id++++++++++++Reverse Bid", result._id)
                                        //Set timeout timer to be controlled by admin
                                        constantsSchema.constantSchema.find({}, {booking_timer: 1}, {lean: true}, function (err, constants) {
                                            const timer = Number(constants[0].booking_timer + 15000)
                                            console.log("timer", timer)
                                            setTimeout(function () {
                                                bookingModel.isBookingAcceptedBySP(result._id, callback)
                                            }, timer);
                                        })
                                    }
                                });

                            }
                            else {
                                var locationData = {};
                                async.waterfall([
                                    function (cb) {
                                        geocoder.reverseGeocode(payload.location.latitude, payload.location.longitude, function (err, data) {
                                            if (err) {
                                                cb(err)
                                            }
                                            else {
                                                // By Chandan Sharma
                                                console.log("location Data", data.results[0].address_components);
                                                var addressData = data.results[0].address_components;
                                                addressData.forEach(function (val, index) {

                                                    if (val.types[0] == "administrative_area_level_1") {

                                                        locationData.locationShort = val.short_name;

                                                    }
                                                    if (val.types[0] == "country") {

                                                        locationData.countryName = val.short_name;

                                                    }

                                                });
                                                console.log('===>', locationData);
                                                cb(null, locationData);
                                            }
                                        });
                                    },
                                    function (locationData, cb) {
                                        stateCodesSchema.CodeSchema.findOne({
                                            code: locationData.locationShort,
                                            country: locationData.countryName
                                        }, {}, {lean: true}, function (err, location) {
                                            console.log('-----------', location);
                                            if (err) {
                                                cb(err)
                                            }
                                            else {
                                                cb(null, location);
                                            }
                                        })
                                    }
                                ], function (err, data) {
                                    console.log('data in final async series getting location Id : ', data);
                                    if (err) {
                                        callback(err)
                                    }
                                    else {
                                        // In lowest deal only those SP are visible who has made discount active.
                                        etaFilter.filter(function(el){
                                            return el.discount === true
                                        });

                                        if (!data) {
                                            lowestDeal(etaFilter, payload.quantity, null, function (result) {
                                                //if (result) {
                                                    //responseFormatter.formatServiceResponse(result, callback ,'SP list fetched successfully','success',200);
                                                    callback(null, result)
                                                //}
                                            })
                                        } else {
                                            lowestDeal(etaFilter, payload.quantity, data._id, function (result) {
                                                //if (result) {
                                                    //responseFormatter.formatServiceResponse(result, callback ,'SP list fetched successfully','success',200);
                                                    callback(null, result)
                                                //}
                                            })
                                        }
                                    }
                                })

                            }


                        }
                    })


                }


            }
        }
    });
    } // else completed for admin global data filter radius value
}); //callback result for admin global data filter radius value
};
module.exports.CategoriesByGigId = function (gig_id, callback) {
    console.log('gig_id : ', gig_id);
    const id = Mongoose.Types.ObjectId(gig_id);
    gigServiceSchema.Gigs.find({_id: id}, {gig_categories: 1}, function (err, result) {
        console.log('lCategoriesByGigId result :: ', result);
        if (err) {
            logger.error("Find failed", err);
            responseFormatter.formatServiceResponse(err, callback);
        } else {
            if (result && result.length == 0) {
                responseFormatter.formatServiceResponse([], callback, 'No categories found', 'error', 400);
            }
            else {
                responseFormatter.formatServiceResponse(result, callback, 'Get All Categories By GigId Success', 'success', 200);
            }
        }
    });


};


module.exports.addSPTimeSlots = function (payload, callback) {
    let timeData = null
    let spTimeSlots = new spTimeSchema.spTimeSlots(payload)
    async.series([
        function (cb) {
            SPProfileSchema.SPProfile.findOne({profile_id: payload.profile_id}, {}, {lean: true}, function (err, data) {
                if (err) {
                    cb(err)
                }
                else {
                    console.log("provider data", data)
                    if (!data) {
                        responseFormatter.formatServiceResponse({}, cb, 'Sp profile not Created', 'error', 400);
                    }
                    else {
                        cb(null)
                    }
                }
            })
        },
        function (cb) {
            gigsSchema.Gigs.findOne({gigs_id: payload.gigs_id}, {}, {lean: true}, function (err, data) {
                if (err) {
                    cb(err)
                }
                else {
                    if (data) {
                        cb()
                    }
                    else {
                        responseFormatter.formatServiceResponse({}, cb, 'Gig not found', 'error', 400);
                    }
                }
            })
        },
        function (cb) {
            spTimeSlots.save(function (err, data) {
                if (err) {
                    cb(err)
                }
                else {
                    timeData = data
                    cb(null)

                }
            })
        }
    ], function (err, data) {
        if (err) {
            callback(err)
        }
        else {
            data = timeData
            callback(null, data)
        }
    })
}


module.exports.updateSPTimeSlots = function(payload,callback){

    spTimeSchema.spTimeSlots.findOneAndUpdate({provider_id : payload.provider_id}, payload ,{new:true},function(err,data){
        if(err){
            responseFormatter.formatServiceResponse(err, callback ,'Error Occurred','error',500);
        }
        else{
            console.log("update SPTimeSlots data------------",data);
            responseFormatter.formatServiceResponse(data, callback, 'Slot data changed', 'success', 200);

        }
    })
}

module.exports.searchGigs = function (payload, callback) {
    var search = payload.search
    //gigsSchema.gigSchema.find({$text:{$search:"payload.search"}},{},function(err,data)
    gigsSchema.Gigs.find({gig_name: new RegExp('^' + search, 'i')}, {
        service_name: 1,
        service_id: 1
    }, function (err, data) {
        if (err) {
            callback(err)
        }

        else {
            if (data && data.length == 0) {
                responseFormatter.formatServiceResponse({}, callback, 'no such service exist', 'error', 400);
            }
            else {
                callback(null, data)
            }

        }
    })
}


module.exports.getProviderModelTemp = function (payload, callback) {

    SPProfileSchema.SPProfile.findOne({provider_id: payload.provider_id}, {}, {lean: true}, function (err, profileData) {
        console.log('profileData :: ', profileData);
        if (err) {
            logger.error("Find failed", err);
            responseFormatter.formatServiceResponse(err, callback);
        }
        else {
            if (profileData) {
                const parallelF = [];
                profileData.service_and_gigs_info.forEach(function (service) {
                    console.log('service :::   ', service);
                    var service_id = service.service_id;
                    var service_name = service.service_name;
                    service.gigs.forEach(function (result) {
                        console.log('result.gig_id :: ', result.gig_id);
                        parallelF.push(function (cbb) {
                            SPGigLocationMapperSchema.SPGigLocationMapper.find({
                                provider_id: payload.provider_id,
                                gig_id: result.gig_id
                            }, {revenue: 1, pricing: 1, _id: 0,location:1}, {lean: true}, function (err, data) {
                                console.log('err-----', err, ' data ------- ', data);
                                if (err) {
                                    cbb(err, null)
                                }
                                else {
                                    if (data && data.length != 0) {

                                        gigsSchema.Gigs.findOne({gig_id:result.gig_id},{number_of_hours:1},{lean:true},function(err,gigData){
                                            if(err){
                                                cbb(err,null)
                                            }
                                            else{
                                                if(gigData){
                                                    spTimeSchema.spTimeSlots.findOne({provider_id:result.provider_id,gig_id:result.gig_id},{slots:1},{lean:true},function(err,timeSlots){
                                                        if(err){
                                                            cbb(err,null)
                                                        }
                                                        else{
                                                            if(timeSlots){
                                                                result.number_of_hours=gigData.number_of_hours;
                                                                result.slots=timeSlots.slots,
                                                                    result.pricingDetails = data;
                                                                result.service_id = service_id;
                                                                result.service_name = service_name;
                                                                console.log('~~~~~~~ result  :: ', result);
                                                                cbb(null, result);
                                                            }
                                                            else{
                                                                result.number_of_hours=gigData.number_of_hours;
                                                                result.pricingDetails = data;
                                                                result.service_id = service_id;
                                                                result.service_name = service_name;
                                                                console.log('~~~~~~~ result  :: ', result);
                                                                cbb(null, result);
                                                            }

                                                        }
                                                    })
                                                }
                                                else{
                                                    result.pricingDetails = data;
                                                    result.service_id = service_id;
                                                    result.service_name = service_name;
                                                    console.log('~~~~~~~ result  :: ', result);
                                                    cbb(null, result);
                                                }

                                            }
                                        })
                                    } else {
                                        console.log('##### result  :: ', result);
                                        result.service_id = service_id;
                                        result.service_name = service_name;
                                        cbb(null, result);
                                    }

                                }
                            })

                        })
                    })
                })
                console.log("paralleF", parallelF);

                async.parallel(parallelF, function (error, data) {
                    console.log('error data : ------', error, data);
                    if (error) {
                        console.log('error : ', error);
                        responseFormatter.formatServiceResponse(err, callback);
                    }
                    else {
                        console.log("in getProviderModelTemp final", data);
                        profileData.service_and_gigs_info = data;
                        responseFormatter.formatServiceResponse(profileData, callback, '', 'success', 200);
                    }
                });
                /*}else{
                 responseFormatter.formatServiceResponse(profileData , callback ,'','success',200);
                 }*/
            }
            else {
                responseFormatter.formatServiceResponse({}, callback, "No profileData Found.", "error", 404);
            }
        }
    });

};


module.exports.getProviderModel = function (payload, callback) {
    let userData = {}
    let profileData = {}
    let locationData = {}
    let timeData = {}
    //userSchema.User.aggregate([
    //    {
    //        $match: {
    //            _id: require('mongoose').Schema.Types.ObjectId(payload.provider_id)
    //        }
    //    },
    //    {
    //        $lookup:{
    //            from:"SPgiglocationmappings",
    //            localField:"_id",
    //            foreignField:"provider_id",
    //            as:"gigData"
    //        }
    //
    //    },
    //    {
    //        "$group": {
    //            "_id": "$_id",
    //            "subjects": {"$push": "$subjects"}
    //        }
    //    }
    //    }
    //])
    let aggregation = [
        {
            $match: {
                provider_id: payload.provider_id
            }
        },
        {
            $lookup: {
                from: "SPgiglocationmappings",
                localField: "provider_id",
                foreignField: "provider_id",
                as: "gigData"
            }
        },
        {
            "$group": {
                "_id": "$provider_id",
                "subjects": {"$push": "$subjects"}
            }
        }
    ]
    SPProfileSchema.SPProfile.aggregate(aggregation, function (err, data) {
        if (err) {
            callback(err)
        }
        else {
            console.log("aggregation data", data)
            callback(null, data)
        }
    })

    //async.series([
    //    //function(cb){
    //    //    userSchema.User.find({user_id:payload.provider_id},{first_name:1,last_name:1,mobile:1,email:1},{lean:true},function(err,data){
    //    //        if(err){
    //    //            cb(err)
    //    //        }
    //    //        else{
    //    //            if(data && data.length==0){
    //    //                responseFormatter.formatServiceResponse({}, cb, 'Provider not found', 'error', 400);
    //    //            }
    //    //            else{
    //    //                userData=data
    //    //                cb(null)
    //    //            }
    //    //        }
    //    //    })
    //    //},
    //    function (cb) {
    //        SPProfileSchema.SPProfile.find({provider_id: payload.provider_id}, {}, {lean: true}, function (err, data) {
    //            if (err) {
    //                cb(err)
    //            }
    //            else {
    //                if (data && data.length ==0) {
    //                    responseFormatter.formatServiceResponse({}, cb, 'Provider not found', 'error', 400);
    //                }
    //                else {
    //                    console.log("data",data)
    //                    profileData = data
    //                    userData=profileData[0].service_and_gigs_info[0].gigs
    //                    console.log("data at 0 position")
    //                    cb(null)
    //                }
    //
    //            }
    //        })
    //    },
    //    function (cb) {
    //        SPGigLocationMappingSchema.SPGigLocationMapper.find({provider_id: payload.provider_id}, {}, {lean: true}, function (err, data) {
    //            if (err) {
    //                cb(err)
    //            }
    //            else {
    //                if (data && data.length==0) {
    //                    responseFormatter.formatServiceResponse({}, cb, 'Location Pricing not set for SP', 'error', 400);
    //                }
    //                else {
    //                    console.log("data+++++++++++++",data)
    //                    locationData = data
    //
    //                    //userData=locationData[0].service_and_gigs_info[0].gigs
    //                    cb(null)
    //                }
    //
    //            }
    //        })
    //    },
    //    //function(cb){
    //    //    spTimeSchema.spTimeSlots.findOne({provider_id: payload.provider_id}, {}, {lean: true}, function (err, data) {
    //    //        if (err) {
    //    //            cb(err)
    //    //        }
    //    //        else {
    //    //            //if (!data) {
    //    //            //    responseFormatter.formatServiceResponse({}, cb, 'Time Slots Not defined for SP', 'error', 400);
    //    //            //}
    //    //            //else {
    //    //            //    locationData = data
    //    //            //}
    //    //            timeData=data
    //    //            cb(null)
    //    //        }
    //    //    })
    //    //}
    //],function(err,data){
    //    if(err){
    //        callback(err)
    //    }
    //    else{
    //        data=commonFunction.MergeDataWithKey(userData,locationData,"gig_id")
    //        callback(null,data)
    //    }
    //})
}


module.exports.pushTestModel = function (payload, callback) {
    let bookingData = null
    let providerData = null
    let pushDetailsSP = null

    async.series([
        function (cb) {
            let newBooking = new bookingSchema.Booking()
            newBooking.seeker_id = payload.seeker_id,
                newBooking.save(function (err, data) {
                    if (err) {
                        cb(err)
                    }
                    else {
                        bookingData = data,
                            cb(null)
                    }
                })
        },
        function (cb) {
            userSchema.User.findOne({user_id: payload.provider_id}, {}, {lean: true}, function (err, data) {
                if (err) {
                    cb(err)
                }
                else {
                    providerData = data
                    cb(null)
                }
            })
        },
        function (cb) {
            const n = new Date();
            const deviceDetails = []
            const bookPayload = {
                profile_photo: providerData.profilePhoto,
                first_name: providerData.first_name,
                last_name: providerData.last_name,
                booking_type: bookingData.booking_type,
                booking_id: bookingData._id,
                booking_data: n.toISOString(),
                push_type: "new booking"
            }
            deviceDetails.push({
                device_type: payload.device_type,
                device_token: payload.device_token
            });
            pushDetailsSP = {
                deviceDetails: deviceDetails,
                text: "SP Push",
                payload: bookPayload
            }
            sendPush.sendPush(pushDetailsSP, "PROVIDER");
            cb(null)
        }
    ], function (err, data) {
        if (err) {
            callback(err)
        }
        else {
            data = pushDetailsSP
            callback(null, data)
        }
    })
}

module.exports.getProviderBookings = function (payload, callback) {
    bookingSchema.Booking.find({provider_id: payload.provider_id}, function (err, booking) {
        console.log('Booking details returned----------------', booking);
        if (err) {
            logger.error("Find failed", err);
            responseFormatter.formatServiceResponse(err, callback, 'Error Occurred Please Try After Some Time', 'error', 500);
        }
        else {
            if (booking.length != 0) {
                responseFormatter.formatServiceResponse(booking, callback, 'Provider bookings fetched successfully', 'success', 200);
                // callback(null,booking)
            }
            else {
                responseFormatter.formatServiceResponse({}, callback, 'No booking found', 'error', 404);
                // callback(null,{})
            }
        }
    });
}


module.exports.getGigInfoForProvider = function (provider_id, gig_id, service_id, callback) {
    console.log('provider_id  ,  gig_id  ,   service_id', provider_id, gig_id, service_id);
    // /*async.waterfall([
    //     function (cb) {
    //         SPProfileSchema.SPProfile.findOne({
    //             provider_id: provider_id, /*"service_and_gigs_info.service_id " : service_id,*/
    //             "service_and_gigs_info.gigs.gig_id": gig_id
    //         }, {}, {lean: true}, function (err, data) {
    //
    //             console.log('data gig info for provider : ', data);
    //             if (err) {
    //                 cb(err)
    //             }
    //             else {
    //                 console.log("provider data", data)
    //                 if (!data) {
    //                     cb(null, {});
    //                 }
    //                 else {
    //                     console.log('===>', data);
    //
    //                     for (var i = 0; i < data.service_and_gigs_info.length; i++) {
    //                         console.log('data.service_and_gigs_info[i].service_id : ', data.service_and_gigs_info[i].service_id);
    //                         if (data.service_and_gigs_info[i].service_id != service_id) {
    //                             data.service_and_gigs_info.splice(i, 1)
    //                         }
    //                     }
    //                     cb(null, data);
    //                 }
    //             }
    //         })
    //
    //     },
    //     function (providerInfo, cb) {
    //         SPGigLocationMapperSchema.SPGigLocationMapper.find({provider_id: provider_id, gig_id: gig_id}, {
    //             revenue: 1,
    //             pricing: 1,
    //             location: 1,
    //             _id: 0
    //         }, {lean: true}, function (err, data) {
    //             console.log('err-----', err, ' data ------- ', data);
    //             if (err) {
    //                 cb(err, null)
    //             }
    //             else {
    //                 providerInfo.pricingDetails = data;
    //                 cb(null, providerInfo);
    //
    //             }
    //         })
    //
    //     },
    //     function (providerInfoWithPricing, cb) {
    //         spTimeSchema.spTimeSlots.findOne({provider_id: provider_id, gig_id: gig_id}, {
    //             slots: 1,
    //             _id: 0
    //         }, {lean: true}, function (err, data) {
    //             console.log('err-----', err, ' data ------- ', data);
    //             if (err) {
    //                 cb(err, null)
    //             }
    //             else {
    //                 providerInfoWithPricing.timeSlots = data;
    //                 cb(null, providerInfoWithPricing);
    //
    //             }
    //         })
    //
    //     }
    // ], function (err, data) {
    //     console.log('data in final async series getting location Id : ', data);
    //     if (err) {
    //         callback(err)
    //     }
    //     else {
    //         if (!data) {
    //
    //         } else {
    //             responseFormatter.formatServiceResponse(data, callback, '', 'success', 200);
    //         }
    //     }
    // })*/
    let gigData=null
    let providerData=null
    async.series([
        function (cb) {
            gigServiceSchema.Gigs.findOne({gig_id: gig_id}, {}, {lean: true}, function (err, gig) {
                if(err){
                    cb(err)
                }
                else{
                    const id=mongoose.Types.ObjectId(gig_id)
                    SPLocationMapping.Mapper.find({gig: id}, {
                        location: 1,
                        location_name: 1,
                        pricing:1,
                        revenue_model:1
                    },{lean:true}, function (err, location) {
                        if(err){
                            cb(err)
                        }
                        else{
                            console.log("location in mapper function",location)
                            gig.location=location
                            gigData=gig
                            cb(null)
                        }
                    })
                }
            })
        },
        function(cb){
            SPProfileSchema.SPProfile.aggregate(
                // Pipeline
                [
                    // Stage 1
                    {
                        $match: {
                            provider_id: provider_id
                        }
                    },

                    // Stage 2
                    {
                        $unwind: {
                            path: "$service_and_gigs_info",
                            preserveNullAndEmptyArrays: true
                        }
                    },

                    // Stage 3
                    {
                        $match: {
                            'service_and_gigs_info.gigs.gig_id': gig_id
                        }
                    },

                    // Stage 4
                    {
                        $project: {
                            'first_name': 1,
                            'profile_id': 1,
                            'service_and_gigs_info.service_id': 1,
                            'service_and_gigs_info.service_name': 1,
                            'service_and_gigs_info.gigs': {
                                '$filter': {
                                    input: '$service_and_gigs_info.gigs',
                                    as: 'chandan',
                                    cond: {
                                        "$eq": ["$$chandan.gig_id", gig_id]
                                    }
                                }
                            }
                        }
                    }

                    // Stage 5
                   /* {
                        $unwind: {path: "$service_and_gigs_info.gigs"}
                    },

                    // Stage 6
                    {
                        $lookup: {
                            "from": "gigs",
                            "localField": "service_and_gigs_info.gigs.gig_id",
                            "foreignField": "gig_id",
                            "as": "gig"
                        }
                    },

                    // Stage 7
                    {
                        $project: {
                            'first_name': 1,
                            'profile_id': 1,
                            'service_and_gigs_info.service_id': 1,
                            'service_and_gigs_info.service_name': 1,
                            'service_and_gigs_info.gigs': 1,
                            'gig.revenue_model': 1,
                            'gig.pricing': 1
                        }
                    }*/

                ]
            ).exec(function(err,SPdata){
                console.log("SPdata",SPdata)
                if(err){
                    cb(err)
                }
                else{
                    if(SPdata && SPdata.length==0){
                        providerData={}
                        cb(null)
                    }
                    else{
                        SPGigLocationMapperSchema.SPGigLocationMapper.find({provider_id:provider_id,gig_id:gig_id},{location:1,revenue:1,pricing:1,min_hourly_amount:1,is_revenue_paid:1,discount:1},{lean:true},function(err,SPlocation){
                            console.log("SPlocation",SPlocation)
                            if(err){
                                cb(err)
                            }
                            else{
                                spTimeSchema.spTimeSlots.findOne({provider_id:provider_id,gig_id:gig_id},{slots:1,_id:0},{lean:true},function (err,slots) {
                                    if(err){
                                        cb(err)
                                    }
                                    else{
                                        console.log("time slots",slots)
                                        if(slots){
                                            providerData={
                                                first_name:SPdata[0].first_name,
                                                service_and_gigs_info:SPdata[0].service_and_gigs_info,
                                                SPlocation:SPlocation,
                                                slots:slots
                                            }
                                            cb(null)
                                        }
                                        else{
                                            providerData={
                                                first_name:SPdata[0].first_name,
                                                service_and_gigs_info:SPdata[0].service_and_gigs_info,
                                                SPlocation:SPlocation,
                                            }
                                            cb(null)
                                        }
                                    }
                                })
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
            data={
                gig:gigData,
                provider:providerData
            }
            callback(null,data)
        }
    })

}


module.exports.getProviderBookingsByPagination = function (query, path, callback) {
   let sort=null
    if (query.filter.status == 'Confirmed') {
         sort = {updatedAt: -1};
    }
    else {
         sort = {booking_datetime: -1};
    }
    //sort[query.sort_param] = -1;
    var filter = query.filter ? query.filter : {};
    var fields = query.fields ? query.fields : '';
    console.log("filter - : ", filter, "  fields - : ", fields);
    var url = path;
    console.log('query :::   ', query);
    var first = true;
    for (var key in query) {
        if (key != 'pageno' && key != 'fields' && key != 'filter') {
            if (first) {
                url += '?' + key + '=' + query[key];
                first = false;
            }
            else {
                url += '&' + key + '=' + query[key];
            }
        }
    }
    console.log('filter, query.pageno, query.resultsperpage, query.pagelist, url, fields, - - - - ', filter, query.pageno, query.resultsperpage, query.pagelist, url, fields, sort);
    bookingSchema.Booking.paginate(filter, query.pageno, parseInt(query.resultsperpage), query.pagelist, url, fields, callback, sort);
};
/*
 * Service_id is not being used here
 * for provider we are getting gigs where product based is true*/
module.exports.getProductBasedGigsForProvider = function (provider_id, callback) {
    // console.log('provider_id  ,   service_id',provider_id  , service_id);
    /*
     SPProfileSchema.SPProfile.findOne({provider_id:provider_id},{},{lean:true},function(err,data){
     if(err){
     logger.error("Find failed", err);
     responseFormatter.formatServiceResponse(err, callback ,'Error Occurred Please Try After Some Time','error',500);
     }
     else{
     console.log("provider data",data)
     if(!data){
     responseFormatter.formatServiceResponse({}, callback ,'No Provider Profile found ','error',400);
     }
     else{
     console.log("data.service_and_gigs_info",data.service_and_gigs_info)
     for(var i = 0 ; i< data.service_and_gigs_info.length ;i++){
     console.log('data.service_and_gigs_info[i].service_id : ',data.service_and_gigs_info[i].service_id);
     if(data.service_and_gigs_info[i].service_id != service_id){
     data.service_and_gigs_info.splice(i,1);
     i--;
     }
     //console.log('`````````data.service_and_gigs_info :: ',data.service_and_gigs_info);
     //console.log('data.service_and_gigs_info[i] :: ',data.service_and_gigs_info[i]);
     for(var j = 0; j< data.service_and_gigs_info[i].gigs.length ; j++){
     //console.log('data.service_and_gigs_info[i].gigs[j].gig_id : ',data.service_and_gigs_info[i].gigs[j].gig_id);
     if(data.service_and_gigs_info[i].gigs[j].is_product_based == false){
     data.service_and_gigs_info[i].gigs.splice(j,1);
     j--;
     }
     }
     }

     responseFormatter.formatServiceResponse(data, callback ,'Product based gigs found successfully','success',200);
     }
     }
     })
     */
    /* SPProfileSchema.SPProfile.findOne({
     provider_id:provider_id,

     },{
     service_and_gigs_info:1
     },{lean:true},function(err,data){
     if(err){
     callback(err)
     }
     else{
     // console.log("getProductBasedGigsForProvider end",data)
     const pullData= _.filter(data.service_and_gigs_info.gigs,
     {
     gigs: [{is_product_based: true}]
     }
     )
     console.log("lodash data",pullData)
     callback(null,pullData)
     }
     })*/
    /*SPProfileSchema.SPProfile.aggregate(


     // AggregationPipeline
     [
     // Stage 1 match provider id
     {
     $match: {
     provider_id: provider_id
     }
     },

     // Stage 2 open array services_and_gigs_info
     {
     $unwind: {path: "$service_and_gigs_info",
     preserveNullAndEmptyArrays: true}
     },

     // Stage 3 matching that only those are shown where services and gigs info true
     {
     $match: {
     'service_and_gigs_info.gigs.is_product_based':true
     }
     },

     // Stage 4
     {
     $project: {
     first_name:1,
     'service_and_gigs_info.service_id':1,
     'service_and_gigs_info.service_name':1,
     //'service_and_gigs_info':1,
     'service_and_gigs_info.gigs':{
     '$filter':{
     input:'$service_and_gigs_info.gigs',
     as:'chandan',
     cond:{
     "$eq":[ "$$chandan.is_product_based",true]
     }
     }
     }
     }
     }

     ]

     ).exec(function (err, data) {
     console.log("getProductBasedGigsForProvider",JSON.stringify(err),JSON.stringify(data))
     if (err) {
     callback(err)
     }
     else {

     callback(null, data)
     }
     })*/
    console.log("provider_id ++++", provider_id)
    SPProfileSchema.SPProfile.aggregate(
        // Pipeline
        [
            // Stage 1
            {
                $match: {
                    provider_id: provider_id
                }
            },

            // Stage 2
            {
                $unwind: {
                    path: "$service_and_gigs_info",
                    preserveNullAndEmptyArrays: true
                }
            },

            // Stage 3
            {
                $match: {
                    'service_and_gigs_info.gigs.is_product_based': true
                }
            },

            // Stage 4
            {
                $project: {
                    'first_name': 1,
                    'profile_id': 1,
                    'service_and_gigs_info.service_id': 1,
                    'service_and_gigs_info.service_name': 1,
                    'service_and_gigs_info.gigs': {
                        '$filter': {
                            input: '$service_and_gigs_info.gigs',
                            as: 'chandan',
                            cond: {
                                "$eq": ["$$chandan.is_product_based", true]
                            }
                        }
                    }
                }
            },

            // Stage 5
            {
                $unwind: {path: "$service_and_gigs_info.gigs"}
            },

            // Stage 6
            {
                $lookup: {
                    "from": "gigs",
                    "localField": "service_and_gigs_info.gigs.gig_id",
                    "foreignField": "gig_id",
                    "as": "gig"
                }
            },

            // Stage 7
            {
                $project: {
                    'first_name': 1,
                    'profile_id': 1,
                    'service_and_gigs_info.service_id': 1,
                    'service_and_gigs_info.service_name': 1,
                    'service_and_gigs_info.gigs': 1,
                    'gig.revenue_model': 1,
                    'gig.pricing': 1
                }
            }

        ]

        // Created with 3T MongoChef, the GUI for MongoDB - http://3t.io/mongochef

    ).exec(function (err, data) {
        console.log("getProductBasedGigsForProvider", JSON.stringify(err), JSON.stringify(data))
        if (err) {
            callback(err)
        }
        else {
            if (data && data.length == 0) {
                responseFormatter.formatServiceResponse([], callback, 'No product based gigs for provider', 'error', 400);
            }
            else {
                callback(null, data)
            }
        }
    })


}
module.exports.addProductInfoForGig = function (payload, callback) {
    let productInfo = payload.product_info
    let finalData = null
    async.series([
        function (cb) {
            if (payload.hasOwnProperty("product_image") && payload.product_image) {
                let fileName = payload.product_image.filename;
                let tempPath = payload.product_image.path;
                if (typeof payload.product_image !== 'undefined' && payload.product_image.length) {
                    fileName = payload.product_image[1].filename;
                    tempPath = payload.product_image[1].path;
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

                        productInfo.product_image = {
                            original: AWS.s3URL + AWS.folder.aLarge + "/" + fileName,
                            thumbnail: AWS.s3URL + AWS.folder.aLarge + "/" + fileNameFirst + "_thumb." + extension
                        };
                        console.log("file upload success", productInfo.product_image);
                        console.log("teamPhoto");
                        cb(null)
                    }
                });
            }
            else {
                cb(null);
            }
        },
        function (cb) {
            console.log("async waterfall productinfo", productInfo)
            let dataToUpdate = {
                "profile_id": payload.profile_id,
                "provider_id": payload.provider_id,
                "gig_id": payload.gig_id,
                "category_id": payload.category_id
            }
            SPGigProductInfoSchema.SPGigProductsInfo.findOneAndUpdate({
                provider_id: payload.provider_id,
                category_id: payload.category_id
            }, {
                $push: {product_info: productInfo},
                $set: dataToUpdate
            }, {new: true, upsert: true}, function (err, product) {
                if (err) {
                    responseFormatter.formatServiceResponse(err, cb, 'Error Occurred', 'error', 500);
                }
                else {
                    finalData = product
                    cb(null)
                }
            })
        }
    ], function (err, data) {
        if (err) {
            callback(err)
        }
        else {
            data = finalData
            console.log("final data after series", data)
            callback(null, data)
        }
    })
}
module.exports.getProductInfoForGig = function (payload, callback) {
    /*SPGigProductInfoSchema.SPGigProductsInfo.aggregate([
     {
     "$match": {
     gig_id: payload.gig_id
     }
     },
     {
     "$lookup": {
     from: "gigs",
     localField: "gig_id",
     foreignField: "_id",
     as: "productData"
     },
     },
     {
     "$project": {
     provider_id: 1,
     gig_id: 1,
     'productData.gig_name': 1,
     category_id: 1,
     product_info: 1
     }
     }
     ]).exec(function (err, data) {
     if (err) {
     callback(err)
     }
     else {
     console.log("getProductInfoForGig stop", data)
     callback(null, data)
     }
     })
     SPGigProductInfoSchema.SPGigProductsInfo.find({},{},function(err,data)
     {
     if(err)
     {
     callback(err)
     }
     else
     {
     console.log('full data',data);
     callback(data)
     }
     }) */
    /* SPGigProductInfoSchema.SPGigProductsInfo.aggregate( [
     { $group :
     { _id :
     {category_id:"$category_id" }}
     },
     {
     $lookup:
     {
     from: "gigcategories",
     localField: "category_name",
     foreignField: "category_id",
     as: "category_name"
     }
     }
     ] ).exec(function (err, data) {
     if (err) {
     callback(err)
     }
     else {
     if(data &&data.length==0){
     responseFormatter.formatServiceResponse({}, callback, 'No product in Gig for provider', 'error', 400);
     }
     else{
     callback(null, data)
     }
     }
     }) */
    SPGigProductInfoSchema.SPGigProductsInfo.find({
        gig_id: payload.gig_id,
        provider_id: payload.provider_id
    }, {category_id: 1, product_info: 1}, {lean: true}, function (err, product) {
        if (err) {
            callback(err)
        }
        else {
            if (product && product.length == 0) {
                responseFormatter.formatServiceResponse([], callback, 'No products register for gig', 'error', 400);
            }
            else {
                let parallelF = []
                product.forEach(function (result) {
                    console.log('result.provider_id :: ', result);
                    parallelF.push(function (cbb) {
                        gigsSchema.Gigs.findOne({gig_id: payload.gig_id}, {gig_categories: 1}, {lean: true}, function (err, category) {
                            for (var i = 0; i < category.gig_categories.length; i++) {
                                if (category.gig_categories[i]._id == result.category_id) {
                                    result.category_name = category.gig_categories[i].category_name
                                    console.log("in for loop", result.category_name)
                                }
                            }
                            cbb(null, result)
                        })
                    })
                })

                //console.log("paralleF", parallelF);

                async.parallel(parallelF, function (error, data) {
                    console.log('error data : ------', error, data);
                    if (error) {
                        console.log('error : ', error);
                        return callback(err);
                    }
                    else {
                        console.log("final data in format", data)
                        callback(null, data);
                    }
                })
            }
        }
    })
}


module.exports.getAllUnregisteredGigsByServiceId = function (providerId, serviceId, callback) {

    let aggregation = [
        // Stage 1
        {
            $match: {
                provider_id: providerId
            }
        },

        // Stage 2
        {
            $project: {
                'service_and_gigs_info': {
                    '$filter': {
                        input: '$service_and_gigs_info',
                        as: 'gigsArray',
                        cond: {
                            "$eq": ["$$gigsArray.service_id", serviceId]
                        }
                    }
                }
            }
        },
        {
            $project: {
                'service_and_gigs_info.gigs.gig_id': 1
            }
        }
    ]

    SPProfileSchema.SPProfile.aggregate(aggregation, function (err, data) {
        if (err) {
            callback(err)
        }
        else {
            console.log("aggregation data", data);
            var gigIds = [];
            if(data.length !=0 && data[0].service_and_gigs_info.length !=0 && data[0].service_and_gigs_info[0].gigs.length!=0){
                for(var i = 0; i < data[0].service_and_gigs_info[0].gigs.length; i++ ){
                    gigIds.push(data[0].service_and_gigs_info[0].gigs[i].gig_id);
                }
            }else{
                gigIds = [];
            }
            console.log("gigIds ----> ",gigIds);

            gigsSchema.Gigs.aggregate([
                {"$match":{
                    "service_id" : serviceId,
                    "gig_id" : { $nin: gigIds }
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
            ]).exec(function(err,gigData){
                console.log('response from gigModel :: err : ',err,"   gigData :: ",gigData);
                if(err){
                    callback(err)
                }
                else{
                    console.log("in getAllGigsModel aggregation>>>>>",gigData)
                    callback(null,gigData)
                }
            });

        }
    })
}

module.exports.updateSPAvailability = function(payload,callback){

    SPProfileSchema.SPProfile.findOneAndUpdate({provider_id : payload.provider_id}, payload ,{new:true},function(err,data){
        if(err){
            responseFormatter.formatServiceResponse(err, callback ,'Error Occurred','error',500);
        }
        else{
            console.log("in updateSPAvailability data------------",data);
            if(data){
                responseFormatter.formatServiceResponse(data, callback, 'SP availability changed successfully', 'success', 200);
            }else{
                responseFormatter.formatServiceResponse({}, callback, 'SP Profile not found. Please update your profile first.', 'error', 404);

            }

        }
    })
}

module.exports.toggleDiscountFlagForSP = function(payload,callback){

    SPProfileSchema.SPProfile.findOneAndUpdate({provider_id : payload.provider_id}, payload ,{new:true},function(err,data){
        if(err){
            responseFormatter.formatServiceResponse(err, callback ,'Error Occurred','error',500);
        }
        else{
            console.log("in toggleDiscountFlagForSP data------------",data);
            if(data){
                responseFormatter.formatServiceResponse(data, callback, 'SP discount status changed successfully', 'success', 200);
            }else{
                responseFormatter.formatServiceResponse({}, callback, 'SP Profile not found. Please create your profile first.', 'error', 404);

            }

        }
    })
}

module.exports.updateSPRevenuePaymentStatusDummy = function(payload,callback){

    SPGigLocationMappingSchema.SPGigLocationMapper.findOneAndUpdate({provider_id : payload.provider_id}, payload ,{new:true},function(err,data){
        if(err){
            responseFormatter.formatServiceResponse(err, callback ,'Error Occurred','error',500);
        }
        else{
            console.log("in updateSPRevenuePaymentStatusDummy data------------",data);
            if(data){
                responseFormatter.formatServiceResponse(data, callback, 'SP revenue payment status changed successfully', 'success', 200);
            }else{
                responseFormatter.formatServiceResponse({}, callback, 'SP Profile not found. Please update your profile first.', 'error', 404);

            }

        }
    })
};


module.exports.addOrganizationData = function (payload,provider_id, callback) {
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
            let SPorganization = new SPProfileSchema.SPProfile(orgDetails);
            SPorganization.profile_id = SPorganization._id;
            SPorganization.provider_id = provider_id;
            SPorganization.org_tab_flag = true;
            SPorganization.save(function(err,SPorganization) {
                if (err) {
                    responseFormatter.formatServiceResponse(err, callback);
                }
                else {
                    console.log("SPorganization savedData______", SPorganization);
                    finalData = SPorganization;
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
            SPProfileSchema.SPProfile.findOneAndUpdate({"profile_id":payload.organization_profile_id},
                {'insurance_details' : insuranceDetails, $set:{insurance_tab_flag : true}},
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

    SPProfileSchema.SPProfile.findOneAndUpdate({"profile_id":payload.organization_profile_id},
        {'bank_details' : bank_details, $set:{bank_tab_flag : true}},
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
                    responseFormatter.formatServiceResponse(organizationDetails , callback,'SP Organization profile not found','error',404);

                }
            }
        })

};


module.exports.getAllApprovedReviews = function (provider_id , callback) {

    SPProfileSchema.SPProfile.aggregate(
        // Pipeline
        [
            // Stage 1
            {
                $unwind : "$reviews"
            },

            // Stage 2
            {
                $match : {
                    "reviews.is_approved_by_admin" : true
                }
            },

            // Stage 3
            {
                $group : {
                    _id : "$_id",
                    reviews : {$push : "$reviews"}
                }
            }
        ]

        // Created with 3T MongoChef, the GUI for MongoDB - http://3t.io/mongochef

    ).exec(function (err, data) {
        console.log("getAllApprovedReviews", JSON.stringify(err), JSON.stringify(data))
        if (err) {
            logger.error("in getAllApprovedReviews Find failed", err);
            responseFormatter.formatServiceResponse(err, callback);
        }
        else {
            if (data && data.length == 0) {
                responseFormatter.formatServiceResponse([], callback, 'No Reviews found for provider', 'error', 400);
            }
            else {
                responseFormatter.formatServiceResponse(result, callback, 'Get All Reviews By provider id Success', 'success', 200);
                //callback(null, data)
            }
        }
    });

    /*SPProfileSchema.SPProfile.findOne({provider_id : provider_id, reviews: { $elemMatch: { is_approved_by_admin : true }}}, {reviews : 1}, function (err, result) {
        console.log('getAllApprovedReviews result :: ', result);
        if (err) {
            logger.error("Find failed", err);
            responseFormatter.formatServiceResponse(err, callback);
        } else {
            if (result && result.length == 0) {
                responseFormatter.formatServiceResponse([], callback, 'No Reviews found', 'error', 400);
            }
            else {
                responseFormatter.formatServiceResponse(result, callback, 'Get All Reviews By provider id Success', 'success', 200);
            }
        }
    });
*/

};