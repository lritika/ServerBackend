/**
 * Created by cl-macmini-63 on 2/24/17.
 */

'use strict';
const responseFormatter = require('Utils/responseformatter.js');
const bookingSchema = require('schema/mongo/bookingschema.js');
const SPGigLocationMapperSchema = require('schema/mongo/SPgiglocationmapper');
const SPProfileSchema = require('schema/mongo/SPprofile');
const gigsSchema = require('schema/mongo/gigsschema');
const masterServiceSchema = require('schema/mongo/masterserviceschema');
const userSchema = require('schema/mongo/userschema');
const seekerProductSchema=require('schema/mongo/Seekerproductinfo.js');
const  log = require('Utils/logger.js');
const logger = log.getLogger();
var async=require('async');
const messenger = require('Utils/messenger.js');
const push = require('Utils/push.js');
var mongoose = require('mongoose');
const SPpushcount = require('schema/mongo/SPpushcount');
let moment=require('moment');

module.exports={};


module.exports.createBookingForSeekerSelect = function(payload, callback) {

    var booking = new bookingSchema.Booking(payload);
    let bookingFinal=null;
    var self=this
    //booking.is_accepted = true;                           // make it true when SP accepts push
    booking.status = 'Unconfirmed';
    var current_status_object = {
        "status"    : 'Not-Accepted',
        "datetime"  : new Date().toISOString(),
        "status_by" : 'SEEKER'
    };
    booking.current_status_info.push(current_status_object);
    /*booking.current_status_info.status = 'Not-Accepted';
    booking.current_status_info.datetime = new Date().toISOString();*/
    booking.booking_item_info.booked_price=payload.booking_item_info.booked_price;
    logger.debug("booking information: ", booking);
    let providerData = {};
    let seekerData={}
    let gigData={}
    async.series([
        function(cb){
          userSchema.User.findOne({user_id:payload.seeker_id},{},{lean:true},function(err,data){
              if(err){
                  cb(err)
              }
              else{
                  seekerData=data;
                  booking.seeker_device_token=seekerData.device_token
                  booking.seeker_device_type=seekerData.device_type
                  cb(null)
              }
          })
        },
        function(cb){
            //get data here save in a
            const id = mongoose.Types.ObjectId(payload.provider_id);
            userSchema.User.findOne({_id:id},{device_token :1,device_type:1,profilePhoto:1,first_name:1,last_name:1,address:1,locationLatitude:1,locationLongitude:1,role_token:1,provider_notification_flag:1}, function (err, provider) {
                console.log('Provider details returned', provider);
                if (err){
                    logger.error("Find failed", err);
                    cb(err);
                }
                else {
                    providerData = provider;
                    booking.ODS_type=payload.ODS_type
                    booking.seeker_image=seekerData.profilePhoto
                    booking.provider_image=providerData.profilePhoto
                    booking.provider_device_token=providerData.device_token
                    booking.provider_device_type=providerData.device_type;
                    booking.provider_name = providerData.first_name+' '+providerData.last_name;
                    if(payload.is_seeker_location==true){
                        if(payload.virtual_address){
                            booking.is_seeker_location = payload.is_seeker_location,
                                booking.virtual_address=payload.virtual_address
                            console.log("Provider datas virtual",payload)
                            cb(null)
                        }
                        else{
                            booking.is_seeker_location = payload.is_seeker_location;
                            booking.booking_address = payload.booking_address;
                            booking.booking_latitude = payload.booking_latitude;
                            booking.booking_longitude = payload.booking_longitude;
                            booking.booking_address1=payload.booking_address1;
                            booking.booking_latitude1=payload.booking_latitude1;
                            booking.booking_longitude1=payload.booking_longitude1;
                            console.log("Provider datas 123",payload)
                            cb(null)
                        }

                    }
                    else{
                        booking.booking_address=providerData.address
                        booking.booking_latitude=providerData.locationLatitude
                        booking.booking_longitude=providerData.locationLongitude
                        booking.is_seeker_location=payload.is_seeker_location
                        console.log("Provider datas 1234567852 ",providerData);
                        cb(null);
                    }
                }
            });        
        },
        function(cb){
            gigsSchema.Gigs.findOne({gig_id:payload.booking_item_info.gig_id},{gig_id:1,service_id:1,gig_name:1,service_name:1},{lean:true},function(err,data){
                if(err){
                    cb(err)
                }
                else{
                    gigData=data
                    cb(null)
                }
            })
        },
        function(cb){
            booking.booking_item_info.gig_name=gigData.gig_name;
            booking.booking_item_info.service_name=gigData.service_name ;
            booking.on('error', function(err){logger.error('Error saving admin: ', err);})
            //use your data here
            booking.save(function(err,newBooking){
                if (err){
                    //responseFormatter.formatServiceResponse(err, callback);
                    cb(null);
                }
                else {
                    bookingFinal=newBooking
                    console.log("bookingFinal",bookingFinal)
                    cb(null);
                }
            });    
        },
       function(cb){
           const deviceDetails = [];

           let deviceToken = null;
           let deviceType = providerData.device_type;
           let deviceTokenFound = false;


           if(providerData.role_token && providerData.role_token.length){
               for(var i = 0; i < providerData.role_token.length; i++){
                   if(providerData.role_token[i].role == 'PROVIDER'){
                       deviceToken = providerData.role_token[i].token;
                       deviceTokenFound = true;
                       break;
                   }
               }
           }
           console.log('deviceTokenFound --->',deviceTokenFound);
           if(!deviceTokenFound || providerData.provider_notification_flag == false){
               console.log('in bookingmodel.js createBookingForSeekerSelect Failed to Send Push......Device Token not found for ',payload.provider_id," Either this provider is logged out or role_token object is not present in user collection.");
               cb(null);
           }else{
               console.log("device token for push send",deviceToken)
               console.log("device type for push send",deviceType)

               console.log("booking final two data",bookingFinal.booking_type,bookingFinal._id)
               console.log("booking final data",bookingFinal)
               const n=new Date().toISOString()
               let pushData={}
               if(payload.booking_address){
                   pushData.booking_address=payload.booking_address
                   console.log("payload booking address",pushData.booking_address)
               }
               else
               {
                   pushData.booking_address={}
               }

               if(payload.booking_address1){
                   pushData.booking_address1=payload.booking_address1
               }
               else{
                   pushData.booking_address1={}
               }
               if(payload.virtual_address){
                   pushData.virtual_address=payload.virtual_address
               }
               else{
                   pushData.virtual_address=''
               }
               pushData.profile_photo=seekerData.profilePhoto,
                   pushData.first_name=seekerData.first_name,
                   pushData.last_name=seekerData.last_name,
                   pushData.booking_type=bookingFinal.booking_type,
                   pushData.is_seeker_location=bookingFinal.is_seeker_location,
                   pushData.booking_id=bookingFinal._id,
                   pushData.booking_data= n,
                   pushData.push_type= 'new booking' ,
                   pushData.ODS_type=payload.ODS_type,
                   pushData.push_date=n,
                   pushData.bid_amount="",
                   console.log("bookPayload data Seeker Select",pushData)
               deviceDetails.push({
                   device_token  :deviceToken,
                   device_type   :deviceType
               });
               const pushDetailsSP={
                   deviceDetails: deviceDetails,
                   text: "You Have a New Booking Available Please Confirm",
                   payload: pushData
               }

               console.log("push details SP",pushDetailsSP);
               push.sendPush(pushDetailsSP,"PROVIDER");
               //setTim
               console.log("data._id++++++++++++Seeker Select",bookingFinal._id)
               cb(null)
           }

       }
    ],function(err,data){
        console.log('in final function : data : ',data);
        if(err){
            callback(err)
        }
        else{
            data=bookingFinal;
            callback(null,data)
        }
    })
 
};

module.exports.createBookingProducts=function(payload,callback){
    var booking = new bookingSchema.Booking(payload);
    let bookingFinal=null;
    var self=this
    //booking.is_accepted = true;                           // make it true when SP accepts push
    booking.status = 'Unconfirmed';
    var current_status_object = {
        "status"    : 'Not-Accepted',
        "datetime"  : new Date().toISOString(),
        "status_by" : 'SEEKER'
    };
    booking.current_status_info.push(current_status_object);
    /*booking.current_status_info.status = 'Not-Accepted';
     booking.current_status_info.datetime = new Date().toISOString();*/
    booking.booking_item_info.booked_price=payload.booking_item_info.booked_price;
    logger.debug("booking information: ", booking);
    let providerData = {};
    let seekerData={}
    let gigData={}
    async.series([
        function(cb){
            userSchema.User.findOne({user_id:payload.seeker_id},{},{lean:true},function(err,data){
                if(err){
                    cb(err)
                }
                else{
                    seekerData=data;
                    booking.seeker_device_token=seekerData.device_token
                    booking.seeker_device_type=seekerData.device_type
                    cb(null)
                }
            })
        },
        function(cb){
            //get data here save in a
            const id = mongoose.Types.ObjectId(payload.provider_id);
            userSchema.User.findOne({_id:id},{device_token :1,device_type:1,profilePhoto:1,first_name:1,last_name:1,address:1,locationLatitude:1,locationLongitude:1}, function (err, provider) {
                console.log('Provider details returned', provider);
                if (err){
                    logger.error("Find failed", err);
                    cb(err);
                }
                else {
                    providerData = provider;
                    booking.ODS_type=payload.ODS_type
                    booking.seeker_image=seekerData.profilePhoto
                    booking.provider_image=providerData.profilePhoto
                    booking.provider_device_token=providerData.device_token
                    booking.provider_device_type=providerData.device_type
                    if(payload.is_seeker_location==true){
                        if(payload.virtual_address){
                            booking.is_seeker_location = payload.is_seeker_location,
                                booking.virtual_address=payload.virtual_address
                            console.log("Provider datas virtual",payload)
                            cb(null)
                        }
                        else{
                            booking.is_seeker_location = payload.is_seeker_location;
                            booking.booking_address = payload.booking_address;
                            booking.booking_latitude = payload.booking_latitude;
                            booking.booking_longitude = payload.booking_longitude;
                            booking.booking_address1=payload.booking_address1;
                            booking.booking_latitude1=payload.booking_latitude1;
                            booking.booking_longitude1=payload.booking_longitude1;
                            console.log("Provider datas 123",payload)
                            cb(null)
                        }

                    }
                    else{
                        booking.booking_address=providerData.address
                        booking.booking_latitude=providerData.locationLatitude
                        booking.booking_longitude=providerData.locationLongitude
                        booking.is_seeker_location=payload.is_seeker_location
                        console.log("Provider datas 1234567852 ",providerData);
                        cb(null);
                    }
                }
            });
        },
        function(cb){
            gigsSchema.Gigs.findOne({gig_id:payload.booking_item_info.gig_id},{gig_id:1,service_id:1,gig_name:1,service_name:1},{lean:true},function(err,data){
                if(err){
                    cb(err)
                }
                else{
                    gigData=data
                    cb(null)
                }
            })
        },
        function(cb){
            booking.booking_item_info.gig_name=gigData.gig_name;
            booking.booking_item_info.service_name=gigData.service_name ;
            booking.on('error', function(err){logger.error('Error saving admin: ', err);})
            //use your data here
            booking.save(function(err,newBooking){
                if (err){
                    //responseFormatter.formatServiceResponse(err, callback);
                    cb(null);
                }
                else {
                    bookingFinal=newBooking
                    console.log("bookingFinal",bookingFinal)
                    cb(null);
                }
            });
        },
        /*function(cb){
            const deviceDetails=[]
            console.log("device token for push send",providerData.device_token)
            console.log("device type for push send",providerData.device_type)

            console.log("booking final two data",bookingFinal.booking_type,bookingFinal._id)
            console.log("booking final data",bookingFinal)
            const n=new Date().toISOString()
            var pushData={
                profile_photo:providerData.profilePhoto,
                first_name:seekerData.first_name,
                last_name:seekerData.last_name,
                booking_type:bookingFinal.booking_type,
                booking_address:bookingFinal.booking_address,
                booking_address1:bookingFinal.booking_address1,
                virtual_address:bookingFinal.virtual_address,
                is_seeker_location:bookingFinal.is_seeker_location,
                booking_id:bookingFinal._id,
                booking_data: n,
                push_type: 'new booking' ,
                ODS_type:payload.ODS_type,
                push_date:n,
                bid_amount:"",
            }
            console.log("bookPayload data Seeker Select",pushData)
            deviceDetails.push({
                device_token  :providerData.device_token,
                device_type   :providerData.device_type,
            });
            const pushDetailsSP={
                deviceDetails: deviceDetails,
                text: "You Have a New Booking Available Please Confirm",
                payload: pushData
            }

            console.log("push details SP",pushDetailsSP)
            push.sendPush(pushDetailsSP,"PROVIDER");
            //setTim
            console.log("data._id++++++++++++Seeker Select",bookingFinal._id)
            cb(null)
        }*/
    ],function(err,data){
        console.log('in final function : data : ',data);
        if(err){
            callback(err)
        }
        else{
            data=bookingFinal;
            //setTimeout(function(){self.isBookingAcceptedBySP(bookingFinal._id,callback)},60000);
            callback(null,data)
        }
    })
}

module.exports.bookingAcceptedBySP = function(payload, callback) {
    let dataToUpdate={}
    let bookingData = {};
    let acceptedData={}
    let bookingUpdatedData = {};
    dataToUpdate.is_accepted = true;
    let current_status_object1={}
    let current_status_object2={}
    if(payload.is_product_based==true){
        dataToUpdate.status = 'Unconfirmed';
         current_status_object1 = {
            "status"   : 'Accepted',
            "datetime" : new Date().toISOString(),
            "status_by": 'PROVIDER'
        }
         current_status_object2={
            "status"   : 'Confirmation-Awaited',
            "datetime" : new Date().toISOString(),
            "status_by": 'PROVIDER'
        };
    }
    else{
        dataToUpdate.status = 'Confirmed';
         current_status_object1 = {
            "status"   : 'Accepted',
            "datetime" : new Date().toISOString(),
            "status_by": 'PROVIDER'
        }
         current_status_object2={
            "status"   : 'Payment-Awaited',
            "datetime" : new Date().toISOString(),
            "status_by": 'PROVIDER'
        };
    }
    let providerData=null;
    let providerLocationData = null;

    dataToUpdate.status = 'Confirmed';
    dataToUpdate.pre_on_the_way=true;
    async.series([
        function(cb){
            userSchema.User.findOne({user_id:payload.provider_id},{address:1,locationLatitude:1,locationLongitude:1,profilePhoto:1,mobile:1,countryCode:1,email:1,device_token:1,device_type:1,first_name:1,last_name:1,average_rating:1,role_token:1}, function (err, provider) {
                console.log('Provider details returned--------------', provider);
                if (err){
                    logger.error("Find failed", err);
                    cb(err);
                }
                else {
                    providerData=provider;
                    cb(null);
                }
            });

        },
        function(cb){
            SPProfileSchema.SPProfile.findOne({provider_id : payload.provider_id},{geometry:1}, function (err, providerdata) {
                console.log('Provider location details returned--------------', providerdata);
                if (err){
                    logger.error("Find failed", err);
                    cb(err);
                }
                else {
                    providerLocationData=providerdata
                    console.log("providerLocationData",providerLocationData)
                    cb(null);
                }
            });

        },
        function(cb){
            let id= mongoose.Types.ObjectId(payload.booking_id)   //mongoo
            //get data here save in a variable
            bookingSchema.Booking.findOne({'_id':payload.booking_id}, function (err, booking) {
                console.log('Booking details returned', booking);
                if (err){
                    logger.error("Find failed", err);
                    responseFormatter.formatServiceResponse(err, cb ,'Error Occurred','error',500);
                    //cb(err);
                }
                else {
                    console.log("bookingData++++++++accepted ",booking);
                    if(booking.is_accepted == true){
                        responseFormatter.formatServiceResponse({}, cb ,'Request Already Accepted','error',400);
                    }
                    else{
                        console.log("providerData in bookingSchema",providerData)
                        console.log("bookingData ",booking);
                        bookingData = booking;
                        console.log("booking ods type",booking.ODS_type)
                        if(booking.ODS_type == 'System Select' || booking.ODS_type == 'Reverse Bid'){
                            dataToUpdate.provider_device_token=providerData.device_token
                            dataToUpdate.provider_device_type=providerData.device_type
                            dataToUpdate.provider_image=providerData.profilePhoto
                            dataToUpdate.provider_name=providerData.first_name+' '+providerData.last_name
                            dataToUpdate.provider_id = payload.provider_id

                            if(payload.is_seeker_location==false){
                                dataToUpdate.booking_address=providerData.address
                                dataToUpdate.booking_latitude=providerLocationData.geometry.coordinates[1]
                                dataToUpdate.booking_longitude=providerLocationData.geometry.coordinates[0]
                            }
                            /*bookingSchema.Booking.findOneAndUpdate({_id:id},{dataToUpdate},{lean:true,new:true},function(err,updateData){
                                if(err){
                                    cb(err)
                                }
                                else{
                                    console.log("updateData n=in system and reverse",updateData)
                                    cb(null)
                                }
                            })*/
                            cb(null)
                        }
                        else {
                            cb(null);
                        }
                    }
                }
            });
        },
        function(cb){
            const SeekerDeviceDetails = [];
            const ProviderDeviceDetails = [];
            console.log("dataToUpdate on Seeker and reverse",dataToUpdate);
            //get data here save in a variable
            bookingSchema.Booking.findOneAndUpdate({_id:payload.booking_id},{$push: {current_status_info:{$each: [current_status_object2,current_status_object1]}},"$set":dataToUpdate},{new:true},function(err,data){
                if(err){
                    responseFormatter.formatServiceResponse(err, cb ,'Error Occurred','error',500);
                }
                else{
                    console.log("updated booking data------------",data);
                    bookingUpdatedData = data;
                    const n = new Date().toISOString();
                    // send push notification to seeker about confirm booking
                    const pushData={
                        provider_photo:providerData.profilePhoto,
                        provider_id   :payload.provider_id,
                        provider_name :payload.provider_name,
                        provider_email:providerData.email,
                        gig_id:bookingData.booking_item_info.gig_id,
                        provider_phone:providerData.mobile,
                        provider_country_code : providerData.countryCode,
                        provider_address:providerData.address,
                        provider_latitude:providerData.locationLatitude,
                        provider_longitude:providerData.locationLongitude,
                        bookingID     :bookingData._id,
                        booking_info  :bookingData.booking_item_info,
                        is_product_based:payload.is_product_based,
                        booking_data:n,
                        push_type:"accept booking",
                        ODS_type:bookingData.ODS_type,
                        average_rating:providerData.average_rating
                    }
                    console.log("bookingData seeker device details",bookingData.seeker_device_token,bookingData.seeker_device_type)
                    SeekerDeviceDetails.push({
                        device_token  :bookingData.seeker_device_token,
                        device_type   :bookingData.seeker_device_type,
                    });
                    ProviderDeviceDetails.push({
                        device_token  :providerData.device_token,
                        device_type   :providerData.device_type,
                    });
                    const formattedDate=moment(n).format('MMMM DD,YYYY')
                    const pushDetailsSPToSeeker={
                        deviceDetails: SeekerDeviceDetails,
                        text: "Congratulations! Your request dated on "+formattedDate +" has been accepted Confirmed",
                        payload: pushData
                    }
                    /*const pushDetailsSeekerToSP={
                        deviceDetails: ProviderDeviceDetails,
                        text: "Congratulations! Your request dated on "+formattedDate +" has been accepted Confirmed",
                        payload: pushData
                    }*/
                    push.sendPush(pushDetailsSPToSeeker,"SEEKER");
                    if(bookingData.ODS_type == 'System Select' || bookingData.ODS_type == 'Reverse Bid'){
                        const pushDetailsSeekerToSP = {
                            deviceDetails: ProviderDeviceDetails,
                            text: "Seeker has successfully recieved the booking details.",
                            payload: {"push_type" : 'confirm-provider',"message" :"Seeker has successfully recieved the booking details"}
                        }

                        push.sendPush(pushDetailsSeekerToSP,"PROVIDER");
                    }
                    cb(null , data);
                }
            })
        },
        function(cb){
            SPpushcount.SPPush.findOneAndUpdate({booking_id:payload.booking_id,provider_id:payload.provider_id},{accepted:true},{lean:true,new:true},function(err,data){
                if(err){
                    cb(err)
                }
                else{
                    acceptedData=data
                    console.log("updated data",data)
                    cb(null)
                }
            })
        },
        function(cb){
            SPProfileSchema.SPProfile.findOneAndUpdate({provider_id : payload.provider_id},{ $inc: { acceptance_count: 1 } },{new:true},function(err,SPData){
                console.log('Booking acceptance count incremented in SP profile  err : ',err, "  SPData :  ",SPData);
                if(err){
                    cb(err);
                }else{
                    cb(null);
                }

            })
        },
        function(cb){
            SPpushcount.SPPush.find({booking_id:payload.booking_id,accepted:false},{},{lean:true},function(err,SPpushcount){
                if(err){
                    cb(err)
                }
                else{
                    console.log("SPpushcount",SPpushcount)
                    const parallelF = []
                    SPpushcount.forEach(function (result) {
                        console.log("result+++++++++++", result)
                        parallelF.push(function (cbb) {
                            const dataToSend=result
                            dataToSend.provider_accepted=payload.provider_id
                            process.emit('refreshDriverLocation', dataToSend);
                            cbb(null)
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
            })
        }
    ],function(err,data){
        console.log('in final function : data : ',data);
        if(err){
            callback(err)
        }
        else{

            data=bookingUpdatedData;
            const n = new Date().toISOString();
            const formattedDate=moment(n).format('MMMM DD,YYYY')
            const msg = 'Congratulations! Your request dated on' +formattedDate+ 'has been Confirmed';

            responseFormatter.formatServiceResponse(data, callback ,msg,'Success',200);
        }
    })

};

//Product Based confirmation

module.exports.productBookingAcceptedBySP = function(payload, callback) {

    let bookingData = {};
    let current_status_object={}
    if(payload.is_product_based==true){
        current_status_object={
            "status"   : 'Payment-Awaited',
            "datetime" : new Date().toISOString(),
            "status_by": 'PROVIDER'
        };
    }
    let providerData=null;
    let providerLocationData = null;

    async.series([
        function(cb){
            userSchema.User.findOne({user_id:payload.provider_id},{address:1,locationLatitude:1,locationLongitude:1,profilePhoto:1,mobile:1,countryCode:1,email:1,device_token:1,device_type:1}, function (err, provider) {
                console.log('Provider details returned--------------', provider);
                if (err){
                    logger.error("Find failed", err);
                    cb(err);
                }
                else {
                    providerData=provider
                    cb(null);
                }
            });

        },
        function(cb){
            SPProfileSchema.SPProfile.findOne({provider_id : payload.provider_id},{geometry:1}, function (err, providerdata) {
                console.log('Provider location details returned--------------', providerdata);
                if (err){
                    logger.error("Find failed", err);
                    cb(err);
                }
                else {
                    providerLocationData=providerdata
                    console.log("providerLocationData",providerLocationData)
                    cb(null);
                }
            });

        },
        function(cb){
            const deviceDetails=[]
            //get data here save in a variable
            bookingSchema.Booking.findOneAndUpdate({_id:payload.booking_id},{$push: {current_status_info: current_status_object},$set:{status:'Confirmed'}},{lean:true,new:true},function(err,data){
                if(err){
                    responseFormatter.formatServiceResponse(err, cb ,'Error Occurred','error',500);
                }
                else{
                    console.log("updated booking data------------",data);
                    bookingData = data;
                    const n = new Date().toISOString()
                    // send push notification to seeker about confirm booking
                    const pushData={
                        provider_photo:providerData.profilePhoto,
                        provider_id   :payload.provider_id,
                        provider_name :payload.provider_name,
                        provider_email:providerData.email,
                        provider_phone:providerData.mobile,
                        provider_country_code : providerData.countryCode,
                        provider_address:providerData.address,
                        provider_latitude:providerData.locationLatitude,
                        provider_longitude:providerData.locationLongitude,
                        bookingID     :bookingData._id,
                        booking_info  :bookingData.booking_item_info,
                        is_product_based:payload.is_product_based,
                        booking_data:n,
                        push_type:"accept booking",
                        ODS_type:bookingData.ODS_type
                    }
                    console.log("bookingData seeker device details",bookingData.seeker_device_token,bookingData.seeker_device_type)
                    deviceDetails.push({
                        device_token  :bookingData.seeker_device_token,
                        device_type   :bookingData.seeker_device_type,
                    });
                    const formattedDate=moment(n).format('MMMM DD,YYYY')
                    const pushDetailsSP={
                        deviceDetails: deviceDetails,
                        text: "Congratulations! Your request dated on "+formattedDate +" has been accepted By"+" "+payload.provider_name,
                        payload: pushData
                    }
                    push.sendPush(pushDetailsSP,"SEEKER");
                    cb(null , data);
                }
            })
        },
    ],function(err,data){
        console.log('in final function : data : ',data);
        if(err){
            callback(err)
        }
        else{
            data=bookingData

            const n = new Date().toISOString()
             const formattedDate=moment(n).format('MMMM DD,YYYY')
            const msg='Congratulations! Your booking dated on " +formattedDate+ " has been confirmed';

            responseFormatter.formatServiceResponse(data, callback ,msg,'Success',200);
        }
    })

};

module.exports.bookingRejectedByProvider = function(payload, callback) {
    console.log('payload in reject booking :: ',payload);

    let bookingData = {};
    let bookingUpdatedData = {};
      var current_status_object = {
        "status"   : 'Rejected',
        "datetime" : new Date().toISOString(),
        "status_by": 'PROVIDER'
    } ;
    let dataToUpdate = {
        status   :'Closed',
        date     :new Date().toISOString(),
        status_by:'provider',
        rejection_reason:payload.rejection_reason,
        is_rejected:true
    };
    console.log('dataToUpdate :: ',dataToUpdate);
    let providerData=null;
    const id=mongoose.Types.ObjectId(payload.booking_id)
    async.series([
        function(cb){
            //get data here save in a variable

            bookingSchema.Booking.findOne({_id:id}, function (err, booking) {
                console.log('Booking details returned', booking);
                if (err){
                    logger.error("Find failed", err);
                    responseFormatter.formatServiceResponse(err, cb ,'Error Occurred','error',500);
                    //cb(err);
                }
                else {
                    console.log("the data to be rejected ",booking);
                    if(booking.is_accepted == true){
                        responseFormatter.formatServiceResponse({}, cb ,'Request Already accepted','error',400);
                    }
                    else{
                        console.log("bookingData ",booking);
                        bookingData = booking;
                        cb();

                    }
                }
            });
        },
        function(cb){
          userSchema.User.findOne({user_id:payload.provider_id},{provider_name:1,profilePhoto:1,email:1,mobile:1,countryCode:1,locationLatitude:1,locationLongitude:1},{lean:true},function(err,data){
              if(err){
                  cb(err)
              }
              else{
                  if(!data){
                      responseFormatter.formatServiceResponse({}, cb ,'No such User','error',500);
                  }
                  else{
                      providerData=data
                      cb(null)
                  }
              }
          })
        },
        function(cb){
            SPProfileSchema.SPProfile.findOneAndUpdate({provider_id : payload.provider_id},{ $inc: { rejectance_count : 1 } },{new:true},function(err,SPData){
                console.log('Booking rejectance count incremented in SP profile  err : ',err, "  SPData :  ",SPData);
                if(err){
                    cb(err);
                }else{
                    cb(null);
                }

            })
        },
         function(cb){
            const deviceDetails=[]
           
            //get data here save in a variable
            bookingSchema.Booking.findOneAndUpdate({_id:id},{$push:{current_status_info:current_status_object},$set:dataToUpdate},{lean:true,new:true},function(err,data){
                if(err){
                    responseFormatter.formatServiceResponse(err, cb ,'Error Occurred','error',500);
                }
                else{
                    console.log("updated booking data",data);
                    bookingUpdatedData = data;
                    const n = new Date().toISOString()
                    // send push notification to seeker about confirm booking
                    const pushData={
                        provider_photo:providerData.profilePhoto,
                        provider_id   :payload.provider_id,
                        provider_name :providerData.provider_name,
                        provider_email:providerData.email,
                        provider_phone:providerData.mobile,
                        provider_country_code : providerData.countryCode,
                        provider_latitude:providerData.locationLatitude,
                        provider_longitude:providerData.locationLongitude,
                        bookingID     :bookingUpdatedData._id,
                        booking_info  :bookingUpdatedData.booking_item_info,
                        booking_data:n,
                        push_type:"rejected booking",
                        ODS_type:bookingUpdatedData.ODS_type
                    }
                    deviceDetails.push({
                        device_token  :bookingUpdatedData.seeker_device_token,
                        device_type   :bookingUpdatedData.seeker_device_type,
                    });
                    const formattedDate=moment(n).format('MMMM DD YYYY')
                    const pushDetailsSP={
                        deviceDetails: deviceDetails,
                        //"Your request timed at "+formattedDate+" has been rejected due to following reason:"+" "+payload.rejection_reason,
                        text: "Your Booking Has Been Declined",
                        payload: pushData
                    }
                    push.sendPush(pushDetailsSP,"SEEKER");
                    cb(null , data);
                }
            })
        }],function(err,data){
        console.log('data recieved by sp: ',data);
        if(err){
            callback(err)
        }
        else{
            data=bookingUpdatedData
            responseFormatter.formatServiceResponse(data, callback ,'Your Booking has been declined','Success',200);
        }
    })

};
//function checking already accepted booking

module.exports.productBookingRejectedBySP = function(payload, callback) {

    let bookingData = {};
    let bookingUpdatedData = {};
      var current_status_object = {
     "status"   : 'Rejected',
     "datetime" : new Date().toISOString(),
     "status_by": 'PROVIDER'
     } ;
    let dataToUpdate = {
        status   :'Closed',
        date     :new Date().toISOString(),
        status_by:'provider',
        rejection_reason:payload.rejection_reason,
        $set:{is_rejected:true}
    };
    console.log('dataToUpdate :: ',dataToUpdate);
    let providerData=null;
    const id=mongoose.Types.ObjectId(payload.booking_id)
    async.series([
        function(cb){
            //get data here save in a variable

            bookingSchema.Booking.findOne({_id:id}, function (err, booking) {
                console.log('Booking details returned', booking);
                if (err){
                    logger.error("Find failed", err);
                    responseFormatter.formatServiceResponse(err, cb ,'Error Occurred','error',500);
                    //cb(err);
                }
                else {
                    console.log("the data to be rejected ",booking);
                    if(booking.is_accepted == true){
                        responseFormatter.formatServiceResponse({}, cb ,'Request Already accepted','error',400);
                    }
                    else{
                        console.log("bookingData ",booking);
                        bookingData = booking;
                        cb();

                    }
                }
            });
        },
        function(cb){
            userSchema.User.findOne({user_id:payload.provider_id},{provider_name:1,profilePhoto:1,email:1,mobile:1,countryCode:1,locationLatitude:1,locationLongitude:1},{lean:true},function(err,data){
                if(err){
                    cb(err)
                }
                else{
                    if(!data){
                        responseFormatter.formatServiceResponse({}, cb ,'No such User','error',500);
                    }
                    else{
                        providerData=data
                        cb(null)
                    }
                }
            })
        },
        function(cb){
            const deviceDetails=[]

            //get data here save in a variable
            bookingSchema.Booking.findOneAndUpdate({_id:id},{$push:{current_status_info:current_status_object},$set:dataToUpdate},{lean:true,new:true},function(err,data){
                if(err){
                    responseFormatter.formatServiceResponse(err, cb ,'Error Occurred','error',500);
                }
                else{
                    console.log("updated booking data",data);
                    bookingUpdatedData = data;
                    const n = new Date().toISOString()
                    // send push notification to seeker about confirm booking
                    const pushData={
                        provider_photo:providerData.profilePhoto,
                        provider_id   :payload.provider_id,
                        provider_name :providerData.provider_name,
                        provider_email:providerData.email,
                        provider_phone:providerData.mobile,
                        provider_country_code : providerData.countryCode,
                        provider_latitude:providerData.locationLatitude,
                        provider_longitude:providerData.locationLongitude,
                        bookingID     :bookingUpdatedData._id,
                        booking_info  :bookingUpdatedData.booking_item_info,
                        booking_data:n,
                        push_type:"rejected booking",
                        ODS_type:bookingUpdatedData.ODS_type
                    }
                    deviceDetails.push({
                        device_token  :bookingUpdatedData.seeker_device_token,
                        device_type   :bookingUpdatedData.seeker_device_type,
                    });
                    const formattedDate=moment(n).format('MMMM DD YYYY')
                    const pushDetailsSP={
                        deviceDetails: deviceDetails,
                        text: "Your request timed at "+formattedDate+" has been rejected due to following reason:"+" "+payload.rejection_reason,
                        payload: pushData
                    }
                    push.sendPush(pushDetailsSP,"SEEKER");
                    cb(null , data);
                }
            })
        }],function(err,data){
        console.log('data recieved by sp: ',data);
        if(err){
            callback(err)
        }
        else{
            data=bookingUpdatedData
            responseFormatter.formatServiceResponse(data, callback ,'Booking rejected','Success',200);
        }
    })

};

module.exports.isBookingAcceptedBySP=function(bookingID,callback){
    const id = mongoose.Types.ObjectId(bookingID);
    bookingSchema.Booking.findOne({_id:id,is_accepted:true}, function (err, booking) {
        console.log('Booking details returned----------------', booking);
        if (err){
            logger.error("Find failed", err);
            responseFormatter.formatServiceResponse(err, callback ,'Error Occurred Please Try After Some Time','error',500);
        }
        else {
            console.log("is bookingAccepted>>> booking",booking)

            if(!booking){
                responseFormatter.formatServiceResponse({}, callback ,'service provider is busy at this moment please try again later','success',200);
            }
            else{
                callback(null,booking)
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

module.exports.acceptedDataSP=function(payload,callback){
    async.waterfall([
        function(cb){
            userSchema.User.findOne({user_id:payload.provider_id},{email:1 , first_name:1, last_name:1, mobile:1, countryCode:1, profilePhoto:1,address:1},{lean:true},function(err,provider){
                if(err){
                    cb(err)
                }
                else{
                    //providerinfo=data
                    cb(null , provider);
                }
            })
        },
        function(providerinfo , cb){
            SPGigLocationMapperSchema.SPGigLocationMapper.findOne({provider_id:payload.provider_id},{revenue:1,pricing:1,_id:0},{lean:true},function(err,data){
                console.log('err-----',err,'pricing data initial------- ',data);
                if(err){
                    cb(err, null)
                }
                else{
                    if(data && data.pricing){

                        console.log('pricing data final :: ',data);
                        providerinfo.pricingDetails = data;

                        cb(null,providerinfo);
                    } else{

                        cb(null,providerinfo);
                    }

                }
            })
        },
        function(providerinfo,cb){
            SPProfileSchema.SPProfile.findOne({provider_id:payload.provider_id},{geometry:1 ,reviews:1},{lean:true},function(err,SPprofile){
                if(err){
                    cb(err)
                }
                else{
              if(SPprofile && SPprofile.geometry){
                  providerinfo.geometry=SPprofile.geometry;
                  providerinfo.reviews=SPprofile.reviews;
                  cb(null,providerinfo)
              }
                    else{
                  cb(null,providerinfo)
              }

                }
            })
        }
    ],function(err,data){
        console.log("sbse final",err,data);
        if(err){
            callback(err)
            console.log("err+++++++",err)
        }
        else{
            callback(null,data)
            console.log("data+++++++",data)
        }
    })
}

module.exports.getBookingDetails=function(bookingID,callback){
    const id = mongoose.Types.ObjectId(bookingID);
    bookingSchema.Booking.findOne({_id:id},{},{lean:true}, function (err, booking) {
        console.log('Booking details returned----------------', booking);
        if (err){
            logger.error("Find failed", err);
            responseFormatter.formatServiceResponse(err, callback ,'Error Occurred Please Try After Some Time','error',500);
        }
        else {
            if(booking) {
                booking.date = new Date().toISOString();
                responseFormatter.formatServiceResponse(booking, callback, 'booking details found', 'success', 200);
            }
            else{
                responseFormatter.formatServiceResponse({}, callback ,'No Booking Found.','error',404);

            }
        }
    });
}


module.exports.startBooking=function(bookingID,callback){
    const id = mongoose.Types.ObjectId(bookingID);
    bookingSchema.Booking.findOneAndUpdate({_id:id},{"current_status_info.status" : 'started',"current_status_info.datetime" : new Date().toISOString(),status : 'Confirmed'},{new:true},function(err,data){
        if(err){
            responseFormatter.formatServiceResponse(err, callback ,'Error Occurred','error',500);
        }
        else{
            console.log("updated booking data------------",data);
            responseFormatter.formatServiceResponse(data, callback, 'booking status changed to started', 'success', 200);

        }
    })
}

module.exports.onTheWay=function(bookingID,callback){
    const id = mongoose.Types.ObjectId(bookingID);
    bookingSchema.Booking.findOneAndUpdate({_id:id},{"current_status_info.status" : 'on-the-way', "current_status_info.datetime" : new Date().toISOString() , status : 'Confirmed'},{new:true},function(err,data){
        if(err){
            responseFormatter.formatServiceResponse(err, callback ,'Error Occurred','error',500);
        }
        else{
            console.log("updated booking data------------",data);
            responseFormatter.formatServiceResponse(data, callback, 'booking status changed to onTheWay', 'success', 200);

        }
    })
}
module.exports.pauseBooking=function(bookingID,callback){
    const id = mongoose.Types.ObjectId(bookingID);
    bookingSchema.Booking.findOneAndUpdate({_id:id},{"current_status_info.status" : 'paused', "current_status_info.datetime" : new Date().toISOString(), status : 'Confirmed'},{new:true},function(err,data){
        if(err){
            responseFormatter.formatServiceResponse(err, callback ,'Error Occurred','error',500);
        }
        else{
            console.log("updated booking data------------",data);
            responseFormatter.formatServiceResponse(data, callback, 'booking status changed to paused', 'success', 200);

        }
    })
}

module.exports.resumeBooking=function(bookingID,callback){
    const id = mongoose.Types.ObjectId(bookingID);
    bookingSchema.Booking.findOneAndUpdate({_id:id},{"current_status_info.status" : 'resumed', "current_status_info.datetime" : new Date().toISOString() ,status : 'Confirmed'},{new:true},function(err,data){
        if(err){
            responseFormatter.formatServiceResponse(err, callback ,'Error Occurred','error',500);
        }
        else{
            console.log("updated booking data------------",data);
            responseFormatter.formatServiceResponse(data, callback, 'booking status changed to resumed', 'success', 200);

        }
    })
}

module.exports.endBooking=function(bookingID,callback){
    const id = mongoose.Types.ObjectId(bookingID);
    bookingSchema.Booking.findOneAndUpdate({_id:id},{"current_status_info.status" : 'ended', "current_status_info.datetime" : new Date().toISOString() ,status : 'Confirmed'},{new:true},function(err,data){
        if(err){
            responseFormatter.formatServiceResponse(err, callback ,'Error Occurred','error',500);
        }
        else{
            console.log("updated booking data------------",data);
            responseFormatter.formatServiceResponse(data, callback, 'booking status changed to ended', 'success', 200);

        }
    })
}

module.exports.rateSeekerForBooking=function(bookingID,payload,callback){
    const id = mongoose.Types.ObjectId(bookingID);
    let current_status_object = {
        "status"   : 'rated',
        "datetime" : new Date().toISOString(),
        "status_by": 'PROVIDER'
    } ;
    let dataToUpdate = {
        "seeker_rating" : payload,
        "status"        : 'Closed'
    }
    
    bookingSchema.Booking.findOneAndUpdate({_id:id},{$push: {current_status_info: current_status_object}, $set: dataToUpdate},{new:true},function(err,data){
        if(err){
            responseFormatter.formatServiceResponse(err, callback ,'Error Occurred','error',500);
        }
        else{
            console.log("updated booking data------------",data);
            responseFormatter.formatServiceResponse(data, callback, 'Thank you for rating us', 'success', 200);

        }
    })
}

module.exports.rateSPForBooking=function(bookingID,payload,callback){
    const id = mongoose.Types.ObjectId(bookingID);
    let current_status_object = {
        "status"   : 'rated',
        "datetime" : new Date().toISOString(),
        "status_by": 'SEEKER'
    } ;
    let dataToUpdate = {
        "SP_rating" : payload,
        "status"    : 'Closed'
    }
    bookingSchema.Booking.findOneAndUpdate({_id:id},{$push: {current_status_info: current_status_object}, $set: dataToUpdate},{new:true},function(err,data){
        if(err){
            callback(err)
        }
        else{
            console.log("updated booking data------------",data);
            SPProfileSchema.SPProfile.findOneAndUpdate({provider_id : data.provider_id},{$push: {ratings: payload.rating}},{lean:true,new:true},function(err,SPRatingData){
                console.log('SP rating successfully pushed to SP profile  err : ',err, "  SPRatingData :  ",SPRatingData);
                if(err){
                    callback(err)
                    //responseFormatter.formatServiceResponse(err, callback ,'Error Occurred','error',500);
                }else{
                    if(SPRatingData == null || !SPRatingData){
                        console.log('in rateSPForBooking model error ::: No Provider Found. Please check Server.')
                        callback(null,data);
                    }else{
                        let numberOfBooking;
                        let averageRating
                        if(SPRatingData.average_rating && SPRatingData.number_of_bookings ){
                            numberOfBooking = Number(SPRatingData.number_of_bookings)+1;
                            averageRating = (Number(SPRatingData.average_rating) + Number(payload.rating))/numberOfBooking
                        }
                        else{
                            numberOfBooking =1
                            averageRating=Number(payload.rating) //because only one value present
                        }
                        SPProfileSchema.SPProfile.findOneAndUpdate({provider_id:data.provider_id},{average_rating:averageRating,number_of_bookings:numberOfBooking, $push :{reviews :payload.feedback}},{lean:true,new:true},function(err,ratingUpdated){
                            if(err){
                                callback(err)
                            }
                            else{
                                console.log("in function rating ratingUpdated",ratingUpdated)
                                callback(null,data)
                            }
                        })
                    }

                }

            })


        }
    })
}
module.exports.bulkUpdateModel=function(payload,callback){



    gigsSchema.Gigs.update({}, {
        $set: {
            booking_location:payload.booking_location
        }
    },{ multi: true },function(err,data){
        if(err){
           callback(err)
        }
        else{
            console.log("updated booking data------------",data);
           callback(null,data)

    gigsSchema.Gigs.updateMany({"repetitions.today": {$gt: 0}},
        {
            $set: {
                "repetitions.today": 0,
            }
        }, function(err, activity){
            if (err) throw err;
        });




        }
    })
}

module.exports.bookingConfirmedProduct=function(payload,callback){
    let productData=null
    let updatedData=null
    async.series([
        function(cb){
        let dataToUpdate={};
        if(payload.booking_datetime){
            dataToUpdate.booking_datetime=payload.booking_datetime
        }
       /* if(payload.booked_price_value){
            dataToUpdate.booked_price_value=payload.booked_price_value
        }
        if(payload.booked_price_type){
            dataToUpdate.booked_price_type=payload.booked_price_type
        }*/
            if(payload.net_amount){
                dataToUpdate.net_amount=payload.net_amount
            }
        console.log("in confirm booking seeker dataToUpdate",dataToUpdate);
        const id = mongoose.Types.ObjectId(payload.bookingID);
        bookingSchema.Booking.findOneAndUpdate({_id:id},dataToUpdate,{lean:true,new:true},function(err,data){
            if(err){
                cb(err)
            }
            else{
                console.log("updated booking data------------",data);
                updatedData=data
                cb(null)
            }
        });
    },
        function(cb){
            const deviceDetails=[]
            if(payload.isProduct==true){
                let saveData={
                    booking_id:payload.booking_id,
                    product:payload.product,
                    seeker_id:payload.seeker_id
                }
                const n = new Date().toISOString()
                const seekerProduct=new seekerProductSchema.SeekerProduct(saveData)
                seekerProduct.save(function(err,seekerproductData){

                    if(err){
                       cb(err)
                    }
                    else{
                        console.log("seekerproductData",seekerproductData)
                        productData=seekerproductData
                        //push to SP for Confirmation of Product
                        const pushData={
                            booking_id:payload.booking_id,
                            seeker_id:payload.seeker_id,
                            seeker_image:updatedData.seeker_image,
                            booking_address:updatedData.booking_address,
                            product:payload.product,
                            booking_datetime:n

                        }
                        deviceDetails.push({
                            device_token  :updatedData.provider_device_token,
                            device_type   :updatedData.provider_device_token,
                        });
                        const formattedDate=moment(n).format('MMMM DD YYYY')
                        const pushDetailsSP={
                            deviceDetails: deviceDetails,
                            text: "Congratulations! Your request dated on "+formattedDate +" has been accepted By"+" "+payload.provider_name,
                            payload: pushData
                        }
                        push.sendPush(pushDetailsSP,"PROVIDER");
                        cb(null , data);
                    }
                })
            }
            else{
                cb(null)
            }

        }
    ],function(err,data){
        if(err){
            callback(err)
        }
        else{
            data=productData
            callback(null,data)
        }
    })
}


module.exports.getSeekerBookingsByPagination = function(query, path, callback){
    let sort=null;
    if(query.filter.status=='Confirmed')
    {
         sort = {updatedAt:-1};
    }
    else
    {
         sort = {booking_datetime:-1};
    }
    //sort[query.sort_param] = -1;
    var filter = query.filter ? query.filter : {};
    var fields = query.fields ? query.fields : '';
    console.log("filter - : ",filter,"  fields - : ",fields);
    var url = path;
    console.log('query :::   ',query);
    var first = true;
    for(var key in query){
        if(key != 'pageno' && key != 'fields' && key != 'filter'){
            if(first){
                url += '?' + key + '=' + query[key];
                first = false;
            }
            else{
                url += '&' + key + '=' + query[key];
            }
        }
    }
    console.log('filter, query.pageno, query.resultsperpage, query.pagelist, url, fields, - - - - ',filter , query.pageno , query.resultsperpage , query.pagelist , url , fields,sort );
    bookingSchema.Booking.paginate(filter, query.pageno, parseInt(query.resultsperpage), query.pagelist, url, fields,callback,sort);
};


module.exports.bookingCronStatus=function(callback){
    let bulk = SPProfileSchema.SPProfile.initializeOrderedBulkOp();
    var counter = 0;
    SPProfileSchema.SPProfile.find({pre_on_the_way:false,is_accepted:true},{booking_datetime:1,pre_on_the_way:1}).forEach(function(data) {
        if (data&& data.booking_datetime) {
            let serverTime =Math.round(new Date().getTime()/1000.0)
            let localTime=moment(data.booking_datetime).unix()
            if(serverTime-localTime == 7.2e+6){

            }
            var updoc = {
                "$set": {}
            };
            updoc["$set"]["gig_specific_param.profile_cards"] = newCards;
            print("updoc %s",updoc);
            bulk.find({
                "_id": data._id
            }).update(updoc);
            counter++;
            if (counter % 10 == 0) {
                bulk.execute();
                bulk = db.gigs.initializeOrderedBulkOp();
            }
        }

    });
    if (counter % 10 != 0) bulk.execute();
}

module.exports.getBookingDetailsForMonth = function(provider_id ,month,year, callback){

    let endMonth = parseInt(month)+1;
    if(endMonth < 10){
        endMonth = '0'+endMonth
    }
    if(endMonth == 13){
        endMonth = '01';
        year = Number(year)+1
    }

    let startDateString = year+"-"+month+"-"+'01'+" 00:00:00.000Z";
    let endDateString = year+"-"+endMonth+"-"+'01'+" 00:00:00.000Z";

    console.log("startDateString ",startDateString);
    console.log("endDateString ",endDateString);

    let startLocalMoment = moment(startDateString).toISOString();
    let endLocalMoment = moment(endDateString).toISOString();

    console.log('start : ',startLocalMoment, "    end : ",endLocalMoment);

    bookingSchema.Booking.find({provider_id : provider_id , booking_datetime : {$gte: startLocalMoment, $lte: endLocalMoment}},{},{lean:true}, function (err, booking) {
        console.log('Booking details returned----------------', booking);
        if (err){
            logger.error("Find failed", err);
            responseFormatter.formatServiceResponse(err, callback ,'Error Occurred Please Try After Some Time','error',500);
        }
        else {
            if(booking) {
                //booking.date = new Date().toISOString();
                responseFormatter.formatServiceResponse(booking, callback, 'booking details found', 'success', 200);
            }
            else{
                responseFormatter.formatServiceResponse({}, callback ,'No Booking Found.','error',404);

            }
        }
    }).sort({booking_datetime: 1});
}

module.exports.getAllBookedServicesByUserId = function(user_id,callback){
    bookingSchema.Booking.find({$or:[ {'seeker_id': user_id},{'provider_id' :user_id} ]},{'booking_item_info.service_id' :1},{lean:true}, function (err, booking) {
        console.log('Booking details returned----------------', booking);
        if (err){
            logger.error("Find failed", err);
            responseFormatter.formatServiceResponse(err, callback ,'Error Occurred Please Try After Some Time','error',500);
        }
        else {
            if(booking) {
                let serviceIdsArray = [];
                for(var i = 0 ; i< booking.length ; i++){
                    serviceIdsArray.push(booking[i].booking_item_info.service_id);
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
                        responseFormatter.formatServiceResponse(services, callback, 'booking history details found', 'success', 200);
                    }
                });

            }
            else{
                responseFormatter.formatServiceResponse({}, callback ,'No Booking history details Found.','error',404);

            }
        }
    });
}

module.exports.getAllBookedGigsForSpecificServiceByUserId = function(service_id , user_id,callback){
    bookingSchema.Booking.find({$or:[ {'seeker_id': user_id},{'provider_id' :user_id} ], 'booking_item_info.service_id' : service_id},{'booking_item_info.gig_id' :1},{lean:true}, function (err, booking) {
        console.log('Booking details returned----------------', booking);
        if (err){
            logger.error("Find failed", err);
            responseFormatter.formatServiceResponse(err, callback ,'Error Occurred Please Try After Some Time','error',500);
        }
        else {
            if(booking) {

                var result = [];

                let gigIdsArray = [];
                for(var i = 0 ; i< booking.length ; i++){
                    gigIdsArray.push(booking[i].booking_item_info.gig_id);
                }
                console.log('gigIdsArray',gigIdsArray);
                gigsSchema.Gigs.find({ gig_id : { $in: gigIdsArray } }, function (err, gigsInfo) {
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
                        responseFormatter.formatServiceResponse(result, callback, 'booking history details found', 'success', 200);
                    }
                });

            }
            else{
                responseFormatter.formatServiceResponse([], callback ,'No Booking history details Found.','error',404);

            }
        }
    });
}
