
/**
 * Created by Chandan Sharma on 24/02/17.
 */
'use strict';

//var Config = require('../Config');
//var TokenManager = require('./TokenManager');
var Mongoose = require('mongoose');
const userModel = require('model/user.js');
const SPProfileSchema = require('schema/mongo/SPprofile');
const bookingSchema = require('schema/mongo/bookingschema.js');
const userSchema = require('schema/mongo/userschema.js');
const push = require('Utils/push.js');

module.exports.connectSocket = function (server) {
    if (!server.app) {
        server.app = {}
    }
    server.app.socketConnections = {};
    var io = require('socket.io').listen(server.listener);
    io.on('disconnect', function () {
        console.log("disconnect function hit")
    });

    io.on('connection', function (socket) {

        socket.on('messageFromClient', function (data, err) {
          console.log("in socket messageFromClient",data)
            if(typeof data=='string'){
                data=JSON.parse(data)
            }
            if (data && data.userId) {
                if (server.app.socketConnections.hasOwnProperty(data.userId)) {
                    console.log("console if messageFromServer appServer Data",server.app.socketConnections)
                    console.log("console if messageFromServer",server.app.socketConnections[data.userId])
                    server.app.socketConnections[data.userId].socketId = socket.id;
                    socket.emit('messageFromServer', server.app.socketConnections[data.userId].socketId );
                } else {

                    server.app.socketConnections[data.userId] = {
                        socketId: socket.id
                    };
                    console.log("console else messageFromServer",server.app.socketConnections)
                    socket.emit('messageFromServer', server.app.socketConnections[data.userId].socketId);
                }
            } else {
                server.app.socketConnections[data.userId] = {
                    socketId: socket.id
                };
                console.log("console messageFromServer",server.app.socketConnections)
                socket.emit('messageFromServer', server.app.socketConnections[data.userId].socketId);
            }
        });

        /*location update for provider*/
        socket.on('loc', function (data) {
            console.log("loc event start socket",data)
            if (server.app.socketConnections.hasOwnProperty(data.userId)) {
                server.app.socketConnections[data.userId].socketId = socket.id;
            } else {
                server.app.socketConnections[data.userId] = {
                    socketId: socket.id
                };

            }
            if(typeof data=='string'){
                data=JSON.parse(data)
            }
            var setData = {geometry: {coordinates: [Number(data.longitude), Number(data.latitude)]},mode_of_transport:data.mode_of_transport, i_can_travel:data.i_can_travel}
            SPProfileSchema.SPProfile.findOne({provider_id:data.userId},{},{lean:true},function(err,SPdata){
              if(err){
                  socket.emit('locData', {
                      statusCode: 400,
                      message: "invalid data",
                      data: err
                  });
              }
                else{
                  if(!SPdata){
                      socket.emit('locData', {
                          statusCode: 400,
                          message: "no SP found",
                          data: err
                      });
                  }
                  else{
                      SPProfileSchema.SPProfile.findOneAndUpdate(
                          {provider_id: data.userId},
                          {$set: setData},
                          {
                              lean: true,
                              new: true,
                              upsert: false
                          },
                          function (err, location) {
                              if (err) {
                                  socket.emit('locData', {
                                      statusCode: 400,
                                      message: "invalid data",
                                      data: err
                                  });
                              }
                              else {
                                  console.log("in final socket emission loc",location)
                                  socket.emit('locData',{
                                      statusCode: 200,
                                      message: "Success",
                                      data:(null,location)
                                  });
                              }
                          });
                  }
              }
            })
        });
        /*
         Sockets Events For Confirmed Booking status flow.
         */
        socket.on('change_status', function (data) {
            console.log("change_status event start socket",data)
            const date=new Date()
            if(typeof data=='string'){
                data=JSON.parse(data)
            }
            const id = Mongoose.Types.ObjectId(data.booking_id);
            var dataToPush = {
                status    : data.current_status,
                datetime  :date.toISOString(),
                status_by : data.status_by
            };

            let userIds = [];

            if(server.app.socketConnections[data.seeker_id]){
                userIds.push(server.app.socketConnections[data.seeker_id].socketId)
            }
            if(server.app.socketConnections[data.provider_id]){
                userIds.push(server.app.socketConnections[data.provider_id].socketId)
            }
            console.log("server.app.socketConnections",server.app.socketConnections)
            console.log("userIds",userIds)

            bookingSchema.Booking.findOneAndUpdate({_id:id},  {$push: {current_status_info : dataToPush}},{lean:true,new:true},function(err,bookingData){
                if(err){
                    userIds.forEach((id)=>{
                        io.to(id).emit('serverData',{
                            statusCode:400,
                            message:'error',
                            data:err
                        });
                    });
                }
                else{
                    bookingData.date=date.toISOString();
                    if(userIds.length==2){
                        userIds.forEach((id)=>{
                            io.to(id).emit('serverData',{
                                statusCode:200,
                                message:'Success',
                                data:(null,bookingData)
                            });
                        });
                    }
                    else{
                        let deviceDetails=[]
                        let pushProvider={
                            push_type:'change_status' ,
                            profile_photo:"",
                            first_name:"",
                            last_name:"",
                            booking_type:"",
                            is_seeker_location:"",
                            booking_id:data.booking_id,
                            booking_data:"",
                            ODS_type:"",
                            push_date:"",
                            bid_amount:"",
                            booking_address:"",
                            booking_address1:"",
                            virtual_address:""
                        }
                        let pushSeeker={
                            provider_photo:"",
                            provider_id   :"",
                            provider_name :"",
                            provider_email:"",
                            gig_id:"",
                            provider_phone:"",
                            provider_country_code :"",
                            provider_address:"",
                            provider_latitude:"",
                            provider_longitude:"",
                            bookingID     :data.booking_id,
                            booking_info  :"",
                            is_product_based:"",
                            booking_data:"",
                            push_type:"change_status",
                            ODS_type:""
                        }
                        if(data.status_by=='SEEKER'){
                            deviceDetails.push({
                                device_token  :bookingData.provider_device_token,
                                device_type   :bookingData.provider_device_type,
                            });
                            const pushDetailsSP={
                                deviceDetails: deviceDetails,
                                text: "Your Booking "+data.booking_id+" have status "+data.current_status,
                                payload: pushProvider
                            }
                            push.sendPush(pushDetailsSP,"PROVIDER");
                        }
                        else{
                            deviceDetails.push({
                                device_token  :bookingData.seeker_device_token,
                                device_type   :bookingData.seeker_device_type,
                            });
                            const pushDetailsSP={
                                deviceDetails: deviceDetails,
                                text: "Your Booking "+data.booking_id+" have status "+data.current_status,
                                payload: pushSeeker
                            }
                            push.sendPush(pushDetailsSP,"SEEKER");
                        }
                    }
                }

            });
        });
        /*
        * socket for seeker location update*/
        socket.on('loc_seeker', function (data) {
            console.log("loc_seeker event start socket",data)
            if (server.app.socketConnections.hasOwnProperty(data.userId)) {
                server.app.socketConnections[data.userId].socketId = socket.id;
            } else {
                server.app.socketConnections[data.userId] = {
                    socketId: socket.id
                };

            }
            if(typeof data=='string'){
                data=JSON.parse(data)
            }

            var setData = {
                locationLatitude:data.latitude,
                locationLongitude:data.longitude
            }

            userSchema.User.findOneAndUpdate(
                {user_id: data.userId},
                {$set:setData},
                {
                    lean: true,
                    new: true,
                    upsert: false
                },
                function (err, location) {
                      console.log("loc_seeker event end socket",err,data)
                    if (err) {
                        socket.emit('locDataSeeker', {
                            statusCode: 400,
                            message: "invalid data",
                            data: err
                        });
                    }
                    else {
                        socket.emit('locDataSeeker',{
                            statusCode: 200,
                            message: "Success",
                            data:(null,location)
                        });


                    }
                });
        });
        /*tracking with seeker and provider*/
        socket.on('tracking', function (data) {
            if(typeof data=='string'){
                data=JSON.parse(data)
            }
            const id=Mongoose.Types.ObjectId(data.booking_id)
            bookingSchema.Booking.findOne({_id:id},{seeker_id:1,provider_id:1},{lean:true},function(err,bookingData){
                if(err){
                    socket.emit('trackingListen', {
                        statusCode: 400,
                        message: "invalid data",
                        data: err
                    });
                }
                else{
                    if(data.role=='SEEKER'){
                        SPProfileSchema.SPProfile.findOne({provider_id:bookingData.provider_id},{geometry:1},{lean:true},function(err,provider){
                         bookingData.latitude_longitude=provider.geometry.coordinates
                         console.log('coordinates of seeker', bookingData.latitude_longitude)
                            socket.emit('trackingListen', {
                                statusCode: 200,
                                message: "success",
                                data:bookingData
                            });
                        })
                    }
                    else{
                        userSchema.User.findOne({user_id:bookingData.seeker_id},{locationLatitude:1,locationLongitude:1},{lean:true},function(err,user){
                            if(err){
                                socket.emit('trackingListen', {
                                    statusCode: 200,
                                    message: "success",
                                    data:err
                                });
                            }
                            else{
                                bookingData.latitude_longitude=[user.locationLongitude,user.locationLatitude]
                                socket.emit('trackingListen', {
                                    statusCode: 200,
                                    message: "success",
                                    data:bookingData
                                });
                            }
                        })
                    }
                }
            })


        });
        process.on('refreshDriverLocation', function (countData) {
            console.log("in refresh driver location",countData)
            if(typeof countData=='string'){
                countData=JSON.parse(countData)
            }
            if (server.app.socketConnections.hasOwnProperty(countData.provider_id)) {
                server.app.socketConnections[countData.provider_id].socketId = socket.id;
            } else {
                server.app.socketConnections[countData.provider_id]= {
                    socketId: socket.id
                };

            }
            if(server.app.socketConnections[countData.provider_id].socketId){
                socket.emit('pushCount',{
                   statusCode: 200,
                   message: "success",
                   data:countData
               });
           }
            else{
               console.log("socket id not created")
           }
        });

    });

}


