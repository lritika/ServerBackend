/**
 * Created by cl-macmini-63 on 1/21/17.
 */
'use strict';
const responseFormatter = require('Utils/responseformatter.js');
const masterServiceSchema = require('schema/mongo/masterserviceschema');
const gigServiceSchema = require('schema/mongo/gigsschema');
const serviceLocationMapper=require('schema/mongo/serviceLocationMapper')
const SPprofileSchema=require('schema/mongo/SPprofile')
const  log = require('Utils/logger.js');
const logger = log.getLogger();
var async=require('async')
var config=require('../config');
var AWS = config.amazon.s3
let commonFunction=require('Utils/commonfunction.js');
let mongoose=require('mongoose')

module.exports = {};



var checkServiceByName = function(serviceName, callback){
    masterServiceSchema.MasterService.findOne({'service_name':serviceName}, function (err, service) {
        console.log('Service returned', service);
        if (err){
            logger.error("Find failed", err);
            responseFormatter.formatServiceResponse(err, callback);
        }
        else {
            console.log("service",service);
            responseFormatter.formatServiceResponse((service ? service.toJSON() : null), callback);
        }
    });

};


module.exports.createMasterServices = function(payload , callback){
    console.log("in model createMasterServices : payload   ",payload);
      let dataToSave=payload
    let masterServiceRecord = new masterServiceSchema.MasterService(dataToSave);
    masterServiceRecord.service_id = masterServiceRecord._id;
    masterServiceRecord.service_name = payload.service_name;
    console.log('masterServiceRecord :: ',masterServiceRecord);
    let savedData=null
async.series([
    function(cb){
        checkServiceByName(payload.service_name,function(response) {
            console.log('response  :: ', response);
            if (response.status == 'error') {
                responseFormatter.formatServiceResponse({}, cb, "Error Occured.", 'error', 400);
                return;
            }
            //if service already exists
            if (response.data) {
                responseFormatter.formatServiceResponse({}, cb, "Service already registered with this name.", 'error', 409);
                return;
            }
            else {
            cb()
            }
        });
    },
    function(cb){
        let x={}
        if (payload.hasOwnProperty("service_icon") && payload.service_icon) {
            x = payload.service_icon.filename;
            let tempPath = payload.service_icon.path;
            if(typeof payload.service_icon !== 'undefined' && payload.service_icon.length){
                x = payload.service_icon[1].filename;
                tempPath = payload.service_icon[1].path;
            }
            let extension = x.split('.').pop();
            let fileName=masterServiceRecord._id+"."+extension
            console.log("tempPath",fileName)

            commonFunction.uploadFile(tempPath, fileName, "aLarge", function (err) {

                if (err) {
                    cb(err);
                }
                else {

                    //let x = fileName;

                    //let fileNameFirst = fileName.substr(0, x.lastIndexOf('.'));
                    //let extension = x.split('.').pop();

                    masterServiceRecord.service_icon = {
                        original: AWS.s3URL + AWS.folder.aLarge + "/" + fileName,
                        thumbnail: AWS.s3URL + AWS.folder.aLarge + "/" + masterServiceRecord._id + "_thumb." + extension
                    };

                    console.log("file upload success");
                    console.log("teamPhoto", masterServiceRecord.service_icon);
                    cb(null)

                }
            });
        }
        else {
            cb(null);
        }
    },
    function(cb){
        masterServiceRecord.save(function(err,masterServiceRecord){
            if (err){
                responseFormatter.formatServiceResponse(err, cb);
            }
            else {
                savedData=masterServiceRecord
                console.log("in success :masterServiceRecord created successfully");
                responseFormatter.formatServiceResponse(masterServiceRecord, cb, 'master service created successfully','success',200);
            }
        });
    }
],function(err,data){
    if(err){
        callback(err)
    }
    else{
        data=savedData
        callback(null,data)
    }
})


};

module.exports.getMasterServices = function(callback){
    console.log(['in master service.js getMasterServices() start :'])
    //masterServiceSchema.MasterService.find({},{},{sort:{service_name:1}}, function (err, masterservices) {
    //    if (err){
    //        logger.error("Find failed", err);
    //        responseFormatter.formatServiceResponse(err, callback);
    //    }
    //    else {
    //        if(masterservices && masterservices.length){
    //            console.log(['in master service.js getMasterServices() end :',masterservices])
    //            responseFormatter.formatServiceResponse(masterservices, callback ,'','success',200);
    //        }
    //        else{
    //            console.log(['in master service.js getMasterServices() end :',masterservices])
    //            responseFormatter.formatServiceResponse({}, callback, "No masterservices Found." , "error",404);
    //        }
    //    }
    //});
    masterServiceSchema.MasterService.aggregate([
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
            console.log("in getMasterServices aggregation>>>>>",data)
            callback(data)
        }
    })
};

module.exports.updateMasterService = function(payload , callback){
    let dataToUpdate=payload
    let updatedData=null
    async.series([
        function(cb){
            masterServiceSchema.MasterService.find({service_id:payload.service_id},function(err,data){
                if(err){
                    cb(err)
                }
                else{
                    if(data && data.length ==0){
                        responseFormatter.formatServiceResponse({}, cb , 'No Such Gig Registered ', 'err',400);
                    }
                    else{
                        cb(null)
                    }
                }
            })
        },
        function (cb) {
            let x={}
            if (payload.hasOwnProperty("service_icon") && payload.service_icon) {
                x = payload.service_icon.filename;
                let tempPath = payload.service_icon.path;
                if(typeof payload.service_icon !== 'undefined' && payload.service_icon.length){
                    x = payload.service_icon[1].filename;
                    tempPath = payload.service_icon[1].path;
                }
                let extension = x.split('.').pop();
                const rand=commonFunction.generateRandomString()
                let fileName=payload.service_id+rand+"."+extension
                console.log("tempPath",fileName)
                console.log("tempPath",fileName)

                commonFunction.uploadFile(tempPath, fileName, "aLarge", function (err) {

                    if (err) {
                        cb(err);
                    }
                    else {
                        dataToUpdate.service_icon = {
                            original: AWS.s3URL + AWS.folder.aLarge + "/" + fileName,
                            thumbnail: AWS.s3URL + AWS.folder.aLarge + "/" + payload.service_id+rand + "_thumb." + extension
                        };

                        console.log("file upload success");
                        console.log("teamPhoto");
                        cb(null)

                    }
                });
            }
            else {
                cb(null);
            }
        },
        function(cb){
            masterServiceSchema.MasterService.findOneAndUpdate({service_id:payload.service_id},dataToUpdate,{new:true},function(err,data){
                if(err){
                    responseFormatter.formatServiceResponse(err, callback);
                }
                else{
                    console.log("data__",data)
                    updatedData=data
                    cb(null)
                }
            })
        },
        function(cb){
            gigServiceSchema.Gigs.find({service_id:payload.service_id},{},{lean:true},function(err,data){
                if(err){
                    responseFormatter.formatServiceResponse(err, callback);
                }
                else{
                    if(data &&data.length ==0){
                        cb(null)
                    }
                    else{
                        gigServiceSchema.Gigs.update({service_id:payload.service_id},{service_name : payload.service_name},{multi:true},function(err,data){
                            if(err){
                                responseFormatter.formatServiceResponse(err, callback);
                            }
                            else{
                                console.log("data while updating service name in gigs collection ::: ",data);
                                cb(null);
                            }
                        })
                    }
                }
            })


        },

        function(cb){
            const id=mongoose.Types.ObjectId(payload.service_id)
            serviceLocationMapper.Mapper.find({service:id},{},{lean:true},function(err,data){
                if(err){
                    cb(err)
                }
                else{
                  if(data && data.length==0){
                      cb(null)
                  }
                    else{
                      serviceLocationMapper.Mapper.update({service:id},{service_name : payload.service_name},{multi:true},function(err,data){
                          if(err){
                              cb(err)
                          }
                          else{
                              console.log("data while updating service name in mapper collection ::: ",data);
                              cb(null);
                          }
                      })
                  }
                }
            })

        },
        function(cb){
            SPprofileSchema.SPProfile.find({'service_and_gigs_info.service_id':payload.service_id},
                {},
                {lean:true},
                function(err,data)
                {
                    if(err){
                        cb(err)
                    }
                    else{
                       if(data &&data.length==0){
                           cb(null)
                       }
                        else{
                           SPprofileSchema.SPProfile.update({'service_and_gigs_info.service_id':payload.service_id},
                               {$set: {"service_and_gigs_info.$.service_name": payload.service_name}},
                               {new:true,multi:true},
                               function(err,data){
                                   if(err){
                                       cb(err)
                                   }
                                   else{
                                       console.log("data while updating service name in sp profile schema collection ::: ",data);
                                       cb(null);
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
            data=updatedData
            callback(null,data)
        }
    })

};

module.exports.activateMasterService = function(payload , callback){

    masterServiceSchema.MasterService.update({ service_id: payload.service_id }, payload ,function (err, result) {
        console.log('activateMasterService result :: ',result);
        if(err){
            logger.error("Find failed", err);
            responseFormatter.formatServiceResponse(err, callback);
        }else{
            if(result.nModified != 0){
                responseFormatter.formatServiceResponse({}, callback ,'Service updated successfully','success',200);
            }else{
                responseFormatter.formatServiceResponse({}, callback ,'Service not found','error',404);
            }

        }
    });

};
//Chandan

