/**
 * Created by cl-macmini-149 on 07/02/17.
 */
'use strict';
const responseFormatter = require('Utils/responseformatter.js');
let commonFunction=require('Utils/commonfunction.js');
const gigServiceSchema = require('schema/mongo/gigsschema');
const masterServiceSchema = require('schema/mongo/masterserviceschema');
const mapperSchema = require('schema/mongo/serviceLocationMapper');
const stateCodesSchema=require('schema/mongo/stateCodes')
const  log = require('Utils/logger.js');
var config=require('../config');
const logger = log.getLogger();
var async=require('async')
const jwt = require('jsonwebtoken');
let geocoder=require('geocoder')
var mongoose = require('mongoose');


module.exports={}

module.exports.locationGigsModel=function(payload,callback){
    var locationData = {};
    var stateData=null;
    var finalData=null;
async.series([
    function(cb){
        geocoder.reverseGeocode(payload.latitude,payload.longitude, function ( err, data ) {
               if(err){
                   cb(err)
               }
            else{
            //Created By Pratosh Bhadoriya
                   if(data.results.length==0){
                       responseFormatter.formatServiceResponse([], cb, "Current State is not registered for Service" , "error",400)
                   }
                   else{
                       console.log("location Data",data.results[0].address_components);
                       var addressData = data.results[0].address_components;
                       addressData.forEach(function(val,index){

                           if(val.types[0]=="administrative_area_level_1"){

                               locationData.locationShort =  val.short_name;

                           }
                           if(val.types[0]=="country"){

                               locationData.countryName =  val.short_name;

                           }

                       });
                       console.log('===>',locationData);
                       cb()
                   }
               }
        });
    },
    function(cb){
        stateCodesSchema.CodeSchema.findOne({code:locationData.locationShort,country:locationData.countryName},{},{lean:true},function(err,data){
            if(err){
                cb(err)
            }
            else{
                if(!data){
                    responseFormatter.formatServiceResponse([], cb, "Current State is not registered for Gigs" , "error",400)
                }
                else{
                    console.log("--------***Data",data)
                    stateData=data
                    cb(null)
                }
            }
        })
    },
    function(cb){
        let stateID=mongoose.Types.ObjectId(stateData._id);
        let serviceID=mongoose.Types.ObjectId(payload.serviceID);
        mapperSchema.Mapper.find({location:stateID,service:serviceID}).populate({path: 'gig'}).sort('gig.gig_name').exec(function (err, data) {
            if (err) {
                cb(err)
            }
            else{
               if(data && data.length == 0){
                   responseFormatter.formatServiceResponse([], cb, "No gigs Found" , "error",400)
               }
                else{
                   finalData=data;
                   cb(null)
               }
            }
        })
    }
],function(err,data){
    if(err){
        callback(err)
    }
    else{

        callback(null,finalData)
    }
})
}
module.exports.locationServiceModel=function(payload,callback){
    var locationData = {};
    var stateData=null;
    var finalData=null;
    let prefinal=[]
    async.series([
        function(cb){
            //if(payload.latitude==0&&payload.longitude==0){
            //
            //}
            geocoder.reverseGeocode(payload.latitude,payload.longitude, function ( err, data ) {
                if(err){
                    cb(err)
                }
                else{
                    console.log("reverse geocode data",data)
                    if(data.results.length==0){
                        responseFormatter.formatServiceResponse([], cb, "Current State is not registered for Service" , "error",400)
                    }
                    else{
                        //Created By Pratosh Bhadoriya
                        var addressData = data.results[0].address_components;
                        addressData.forEach(function(val,index){

                            if(val.types[0]=="administrative_area_level_1"){

                                locationData.locationShort =  val.short_name;

                            }
                            if(val.types[0]=="country"){

                                locationData.countryName =  val.short_name;

                            }

                        });
                        console.log('===>',locationData);
                        cb()
                    }
                }
            });
        },
        function(cb){
            stateCodesSchema.CodeSchema.findOne({code:locationData.locationShort,country:locationData.countryName},{},{lean:true},function(err,data){
                if(err){
                    cb(err)
                }
                else{
                    if(!data){
                        responseFormatter.formatServiceResponse([], cb, "Current State is not registered for Service" , "error",400)
                    }
                    else{
                        stateData=data
                        console.log("--------***Data",stateData._id)
                        cb(null)

                    }
                }
            })
        },
        function(cb){
            console.log("stateData ID",stateData._id)
            //let stateID=mongoose.Types.ObjectId(stateData._id);
            //mapperSchema.Mapper.aggregate([
            //    {$match:{locationID:stateID}}
            //    //{
            //    //$group: {_id:null, uniqueValues: {$addToSet: "$service"}},
            //    //}
            //],(function(err,data){
            //    if(err){
            //        cb(err)
            //    }
            //    else{
            //       console.log("AGGREGATION DATA",data)
            //        finalData=data
            //        console.log("aggregation data",finalData)
            //        cb(null)
            //    }
            //}))
                //.exec)
            let stateID=mongoose.Types.ObjectId(stateData._id);
            mapperSchema.Mapper.distinct('service',{location:stateID},function (err, data) {
                if (err) {
                    cb(err)
                }
                else{
                   finalData=data
                    console.log("__________service",finalData)
                    cb(null)
                }
            })
        },
        function(cb){
            var parallelF=[]
            //async.forEach(finalData,function(result){
            //    deviceID.push(result)
            //})
            finalData.forEach(function (id) {

                parallelF.push(function (cbb) {
                    masterServiceSchema.MasterService.findOne({service_id:id , is_active : true},{},{lean:true},function(err,data){
                        if(err){
                            cbb(err)
                        }
                        else{
                            if (data) {
                                prefinal.push(data)
                            }

                            return cbb(null, prefinal);
                        }
                    })

                })
            });

            console.log("paralleF", parallelF);

            async.parallel(parallelF, function (error, data) {

                if (error) {

                    return cb(error);
                }
                else {
                  //const sorted=  data.sort(function(a, b){
                  //     var nameA=a.service_name, nameB=b.service_name
                  //         if (nameA < nameB) //sort string ascending
                  //              return -1
                  //         if (nameA > nameB)
                  //              return 1
                  //             return 0 //default return value (no sorting)
                  //     });

                    //console.log("deviceTeamData",data)
                    console.log("deviceTeamData logs commented.  At line 240 location.js model");

                    cb()
                }
            });

        }

    ],function(err,data){
        if(err){
            callback(err)
        }
        else{
            data=prefinal
            data.sort(function (a, b) {
               const alc=a.service_name.toLowerCase()
                const blc=b.service_name.toLowerCase()
                return alc>blc?1 :alc<blc? -1 :0
            })
            console.log("Sorted data",data)
            callback(null,data)
        }
    })
}

