//'use strict'
//
//const userModel = require( 'model/user.js' );
//const SPProfileSchema = require('schema/mongo/SPprofile');
//var jwt = require('jsonwebtoken');
//var privateKey = '_1.2v^:69F61n151EodW+!925;-Cx-;m.*Z2=^y463B+9Z.49^%7I%3b62%z%;+I';
//module.exports={};
//
//
//var validateToken = function(token, callback){
//    //check if token is valid
//    decodeToken(token, function(err, decodedToken){
//            console.log('*******Running validation...');
//            console.log('*******token:', token); // should be your token
//            console.log('decoded:', decodedToken);  // should be {accountId : 123}.
//        if (err){
//            callback(null, false);
//            return;
//        }
//
//        if (decodedToken) {
//            console.log('socket.js validate: ', decodedToken);
//        }
//
//        //check if user exists
//        //const userModel = require( '../model' );
//        userModel.checkUser(decodedToken.user_id, decodedToken.role,decodedToken.device_token, function(response){
//            if (response.status == 'error'){
//                callback(null, false);
//                return;
//            }
//
//            if (response.data == null || response.data == undefined) {
//                callback(null, false);
//                return;
//            }
//
//            //if user exists
//            if (response.data.exists == true){
//                console.log("decoded Data_____",decodedToken.user_id, decodedToken.role)
//                callback(null, true, {user_id:decodedToken.user_id,role : decodedToken.role, device_token : decodedToken.device_token});
//                return;
//            }
//
//            callback(null, false);
//        });
//
//
//    });
//}
//var decodeToken = function(token, callback){
//    //check if token is valid
//    var options={}
//    jwt.verify(token, privateKey, options, callback);
//}
//
//
//
//
////module.exports.connectSocket = function (server) {
////    console.log('in connectSocket  :::::  ');
////    var io = require('socket.io').listen(server.listener);
////    //if (!server.app) {
////    //    server.app = {}
////    //}
////    ////io.use(function (socket, next) {
////    ////    var token = socket.handshake.query.authorization || null;
////    ////    console.log('token recieved ::::: ',token);
////    ////    if (token) {
////    ////        validateToken(token,function(err,val, data){
////    ////            if(err){
////    ////                console.log("error____",err)
////    ////            }
////    ////            else{
////    ////                console.log("data_____4575_",data);
////    ////                //console.log("connected", data.userData.id);
////    ////                server.app[data.user_id] = socket.id;
////    ////                server.app[socket.id] = data.user_id;
////    ////                console.log("SOCKET________",server.app);
////    ////                io.to(socket.id).emit('connect',{
////    ////                    statusCode  : 200,
////    ////                    message     : "Connected Socket",
////    ////                    data        : data
////    ////                });
////    ////                next();
////    ////            }
////    ////
////    ////       })
////    ////
////    ////    } else {
////    ////        next(new Error('Missing Authentication'));
////    ////    }
////    ////});
////    //
////    //
////    io.on('connection', function (socket) {
////        socket.on('loc', function (data) {
////            var setData = {geometry: {coordinates: [data.longitude, data.latitude]}}
////            console.log(setData);
////            SPProfileSchema.SPProfile.findOneAndUpdate(
////                {provider_id: server.app[socket.id]},
////                {$set: setData},
////                {
////                    lean: true,
////                    new: true,
////                    upsert: false
////                },
////                function (err, data) {
////                console.log(err,data)
////                if (err) {
////                    io.to(socket.id).emit('locData', {
////                        statusCode  : 400,
////                        message     : "invalid data",
////                        data        : err
////                    });
////                }
////                else{
////                    io.to(socket.id).emit('locData',data);
////                }
////            });
////            //data should have lat,long
////
////            //fetch data corresponding to lat long
////            //perform calculations
////            //send data in result
////            //normal code
////
////
////           // io.to(socket.id).emit('locData',result);
////
////        });
////        io.to(socket.id).emit('connect',{
////            statusCode  : 200,
////            message     : "Connected Socket",
////            data        : data
////        });
////        console.log("connection established____________",data)
////
////        socket.on("disconnect", function (socket) {
////            delete server.app[socket.id];
////        });
////
////    });
////
////
////
////    io.on('error', function (socket) {
////        console.log('SOCKET ERROR');
////        socket.destroy();
////    });
////    io.on('connection',function(socket){
////        var socId = socket.conn.id
////        //console.log("++++++++++++++++socId",socId)
////        socket.auth=false;
////        //console.log("first connection Data",socket)
////        io.to(socId).emit('connectionSuccess',{
////            statusCode  : 200,
////            message     : "Connected Socket",
////            data        : socket.conn
////        });
////        socket.on('authenticate',function(data){
////            validateToken(data.token,function(err,val,data){
////                if(err){
////                    console.log("Disconnecting socket ", socId);
////                    socket.disconnect('unauthorized');
////                }
////                else{
////                    console.log("Authenticated socket ", socId);
////                    socket.auth = true;
////                    io.to(socket.id).emit('authSuccess',{
////                        statusCode  : 200,
////                        message     : "Auth Success",
////                        data        : data
////                    })
////                }
////            })
////        })
////    })
//////
////};
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
////'use strict';
////
////const Config = require('../Config');
////
////const CONSTANT = Config.constants;
////
////const TokenManager = require('./TokenManager');
////
////const Models = require('../Models');
////
////const util = require('../Utils/util');
////
////const JWT = require('jsonwebtoken');
////
////const ERROR_MESSAGE = Config.statusMessages.ERROR;
////
////const async = require("async");
////
////const NotificationManager = require("./NotificationManager");
////
////
////
////
////
////
////var validateToken = function(token, callback){
////    //check if token is valid
////    decodeToken(token, function(err, decodedToken){
////        console.log('*******Running validation...');
////        console.log('*******token:', token); // should be your token
////        console.log('decoded:', decodedToken);  // should be {accountId : 123}.
////        if (err){
////            callback(null, false);
////            return;
////        }
////
////        if (decodedToken) {
////            console.log('socket.js validate: ', decodedToken);
////        }
////
////        //check if user exists
////        //const userModel = require( '../model' );
////        userModel.checkUser(decodedToken.user_id, decodedToken.role,decodedToken.device_token, function(response){
////            if (response.status == 'error'){
////                callback(null, false);
////                return;
////            }
////
////            if (response.data == null || response.data == undefined) {
////                callback(null, false);
////                return;
////            }
////
////            //if user exists
////            if (response.data.exists == true){
////                console.log("decoded Data_____",decodedToken.user_id, decodedToken.role)
////                callback(null, true, {user_id:decodedToken.user_id,role : decodedToken.role, device_token : decodedToken.device_token});
////                return;
////            }
////
////            callback(null, false);
////        });
////
////
////    });
////}
////var decodeToken = function(token, callback){
////    //check if token is valid
////    var options={}
////    jwt.verify(token, privateKey, options, callback);
////}
////
////
////
////
////
////exports.connectSocket = function (server) {
////
////    if (!server.app) {
////
////        server.app = {}
////
////    }
////    server.app.socketConnections = {};
////
////    let io = null;
////
////    let socket = require('socket.io').listen(server.listener);
////
////    io = socket;
////
////
////    socket.on('connection', function (socket) {
////
////        console.log("one client connected");
////
////        socket.on('joinSocket', function (data, res) {
////
////            console.log("connection attempt");
////
////            console.log(data);
////
////            let accessToken = data.token || data;
////
////            if (accessToken && accessToken !== "") {
////
////                accessToken = accessToken.trim();
////
////                validateToken(accessToken, function (error, val, decodedData) {
////
////                    if (error) {
////
////                        console.log(error);
////
////                        res(error);
////                    }
////                    else {
////
////                        console.log("decodedData", decodedData);
////
////                        let type = decodedData.role;
////
////                        let id = decodedData.user_id;
////
////                        //create a room from id.
////
////                        let roomId = (id + "/" + type).toString();
////
////                        console.log("room id", roomId);
////
////                        socket.join(roomId);
////
////                        console.log("sockets", socket);
////
////                        res({
////                            data: {
////
////                                'message': 'You have been authenticated via socket.',
////
////                                data: decodedData
////                            }
////                        });
////                    }
////                })
////            }
////            else {
////                res({
////                    data: {
////
////                        'message': 'You have not been authenticated via socket. Please enter correct token.'
////                    }
////                });
////
////            }
////        });
////
////        socket.on('updateLocation', function (data, res) {
////
////            console.log("location update event received!!", data);
////
////            if (typeof(data.token) === 'undefined') {
////
////                let error = new Error('Access token is required.');
////
////                return res(error);
////
////            }
////
////            let driverData;
////            let driverId;
////
////            async.auto({
////
////                getData: function (callback) {
////
////                    util.authenticateToken(data.token, CONSTANT.USER_TYPE.DRIVER, callback);
////                },
////
////                checkData: ['getData', function (results, callback) {
////
////                    driverData = results.getData;
////
////                    driverId = driverData.driverId;
////
////                    let roomId = (driverId + "/" + "DRIVER").toString();
////
////                    socket.join(roomId);
////
////
////                    console.log("driverData", driverData);
////
////                    if (driverData) {
////
////                        return callback(null);
////
////                    }
////                    else {
////                        return callback(ERROR_MESSAGE.INVALID_ACCESS_TOKEN_FORMAT);
////                    }
////                }],
////
////                validateLat: ['checkData', function (results, callback) {
////
////                    console.log("latitude", data.lat);
////
////                    if (data.lat < -90 || data.lat > 90) {
////
////                        console.log("error latitude");
////
////                        return callback(ERROR_MESSAGE.LALTITUDE_OUT_OF_BOUND);
////
////                    }
////                    else {
////
////                        return callback(null);
////
////                    }
////                }],
////
////                validateLong: ['validateLat', function (results, callback) {
////
////                    if (data.long < -180 || data.long > 180) {
////
////                        console.log("error longitude");
////
////                        return callback(ERROR_MESSAGE.LONGITUDE_OUT_OF_BOUND);
////
////                    }
////                    else {
////
////                        return callback(null);
////
////                    }
////                }],
////
////                validateBookingId: ["validateLong", function (results, callback) {
////
////
////                    if (data.bookingId) {
////
////                        let criteria = {
////                            where: {
////                                bookingId: data.bookingId
////                            }
////                        };
////
////                        Models.Booking.find(criteria).then(function (data) {
////
////                            if (data && data.dataValues) {
////
////                                return callback(null);
////                            }
////                            else {
////
////                                return callback(ERROR_MESSAGE.INVALID_BOOKING_ID);
////                            }
////                        }).catch(function (error) {
////
////                            if (error) {
////
////                                return callback(error);
////                            }
////                        });
////
////                    }
////                    else {
////                        return callback(null);
////                    }
////
////                }],
////
////
////                createDriverLocation: ["validateBookingId", function (results, callback) {
////
////                    let dataCreate = {
////
////                        driverId: driverId,
////                        latitude: data.lat,
////                        longitude: data.long,
////                        location: [data.lat, data.long],
////                        addedOn: util.getTimestamp()
////
////                    };
////
////                    if (data.bookingId) {
////                        dataCreate.bookingId = data.bookingId;
////                    }
////
////                    if (data.defaultAddress) {
////
////                        dataCreate.defaultAddress = data.defaultAddress
////                    }
////
////                    console.log("dataCreate", dataCreate);
////
////                    Models.DriverLocation.create(dataCreate).then(function (data) {
////
////                        if (data && data.dataValues) {
////
////                            return callback(null, data.dataValues);
////                        }
////                        else {
////
////                            return callback(null);
////                        }
////                    }).catch(function (error) {
////
////                        if (error) {
////
////                            return callback(error);
////                        }
////                    })
////                }]
////
////            }, function (error) {
////
////                if (error) {
////
////                    let returnMsg = error;
////
////                    console.log("returnMsg", error);
////
////                    let roomId = (driverId + "/" + "DRIVER").toString();
////
////                    io.sockets.in(roomId).emit('serverAck', returnMsg);
////
////                    return res(returnMsg);
////                }
////                else {
////
////                    let returnMsg = "Location updated " + data.lat.toString() + " " + data.long.toString();
////
////                    console.log("returnMsg", returnMsg);
////
////                    let roomId = (driverId + "/" + "DRIVER").toString();
////
////                    io.sockets.in(roomId).emit('serverAck', returnMsg);
////
////                    return res(null, returnMsg);
////                }
////
////            });
////        });
////
////    });
////}
//var app = require('express').createServer();




