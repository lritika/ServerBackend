/**
 * Created by cl-macmini-149 on 31/01/17.
 */
'use strict';
const responseFormatter = require('Utils/responseformatter.js');
let commonFunction=require('Utils/commonfunction.js');
const gigServiceSchema = require('schema/mongo/gigsschema');
const masterServiceSchema = require('schema/mongo/masterserviceschema');
const SPprofileSchema=require('schema/mongo/SPprofile')
const mapperSchema = require('schema/mongo/serviceLocationMapper');
let codeSchema=require('schema/mongo/stateCodes')
const  log = require('Utils/logger.js');
var config=require('../config');
const logger = log.getLogger();
var async=require('async');
var AWS = config.amazon.s3
let _=require('underscore')
let mongoose=require('mongoose')
//auth token module
const jwt = require('jsonwebtoken');

//custom modules

const storageService = require('model/storageservice.js');

module.exports={};

module.exports.updateGigModel=function(payload,callback){
    let gigCategories=null
    let finalData=null
    console.log("payload.gig_categories",payload.gig_categories)
    console.log("payload.skill_level",payload.skill_level)
    if(payload.skill_level){
        payload.skill_level=payload.skill_level.split(',')
    }
    if(payload.gig_booking_options){
        payload.gig_booking_options=payload.gig_booking_options.split(',')
    }

    //if(payload.gig_categories){
    //    gigCategories.gig_categories=payload.gig_categories
    //    console.log("gig_categories in a new function",gigCategories)
    //}

    console.log("payload gig_booking_options",payload.gig_booking_options)
    let dataToUpdate=payload
   /* if(dataToUpdate.gig_categories){
         dataToUpdate.gig_categories
        console.log("data to update with gig_categories",dataToUpdate)
    }*/
    //dataToUpdate.gig_booking_options=payload.gig_booking_options.split(',')

    async.series([
    function(cb){
        gigServiceSchema.Gigs.find({gig_id:payload.gig_id},function(err,data){
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
        if (payload.hasOwnProperty("gig_image") && payload.gig_image) {
            let x={}
            x = payload.gig_image.filename;
            let tempPath = payload.gig_image.path;
            if(typeof payload.gig_image !== 'undefined' && payload.gig_image.length){
                x = payload.gig_image[1].filename;
                tempPath = payload.gig_image[1].path;
            }
            let extension = x.split('.').pop();
            const rand=commonFunction.generateRandomString()
            console.log("rand",rand)
            let fileName=payload.gig_id+rand+"."+extension
            console.log("tempPath",fileName)
            console.log("tempPath",fileName)

            console.log("tempPath",fileName)

            commonFunction.uploadFile(tempPath, fileName, "aLarge", function (err) {

                if (err) {
                    cb(err);
                }
                else {
                    dataToUpdate.gig_image = {
                        original: AWS.s3URL + AWS.folder.aLarge + "/" + fileName,
                        thumbnail: AWS.s3URL + AWS.folder.aLarge + "/" + payload.gig_id+rand + "_thumb." + extension
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
            gigServiceSchema.Gigs.findOneAndUpdate({gig_id:payload.gig_id},dataToUpdate,{new:true},function(err,data){
                if(err){
                    responseFormatter.formatServiceResponse(err, callback);
                }
                else{
                    console.log("data__",data)
                    finalData=data
                    cb(null)
                }
            })
        },
        /*function(cb){
            for(var i in data){
                var service=service_and_gigs_info[i];
              for(var j in data){
            SPprofileSchema.SPProfileSchema.Update({service.gigs.j.gig_id:payload.gig_id},{$set:{service.gigs.j.gig_name:payload.gig_name }},{new:true},function(err,data){
               
              if(err){
                    responseFormatter.formatServiceResponse(err, callback);
                }
                else{
                    console.log("data__",data)
                    finalData=data
                    cb(null)
                }
            }
            }
            })
        },*/
        function(cb){
            const id=mongoose.Types.ObjectId(payload.gig_id)
            mapperSchema.Mapper.update({gig:id},{gig_name:payload.gig_name},{lean:true,new:true},function(err,data){
                if(err){
                    cb(err)
                }
                else{
                    console.log("mapperSchema update",data)
                    cb(null)
                }
            })
        },
        /*function(cb){
            const parallelF=[]
            if(payload.gig_categories){
                if(payload.gig_categories.length==0){
                    responseFormatter.formatServiceResponse({}, cb , 'Please add category in gig_category field ', 'err',400);
                }
                else{
                    payload.gig_categories.forEach(function(result){
                        parallelF.push(function(cbb){
                            const id=mongoose.Types.ObjectId(result.category_id)
                            //Updating each category corresponding to id
                            gigServiceSchema.Gigs.update({gig_id:payload.gig_id},{$set:{'gig_categories.$.category_name':result.category_name}},{lean:true,new:true},function(err,categoryData){
                                if(err){
                                    cbb(err)
                                }
                                else{
                                    console.log("category update function data>>>",categoryData)
                                    cbb(null,categoryData)
                                }
                            })
                        })
                    })
                    async.parallel(parallelF, function (error, data) {

                        if (error) {

                            return cb(error);
                        }
                        else {
                            console.log("__________",data)
                            finalData.gig_categories=data
                            cb(null,data)
                        }
                    });
                }
            }
            else{
                cb(null)
            }
        },*/

    ],function(err,data){
        if(err){
            callback(err)
        }
        else{
            data=finalData
            callback(null,data)
        }
    })
}
module.exports.createGigAdminModel=function(payload,callback){
    let dataToSave=payload
    let masterGigRecord = new gigServiceSchema.Gigs(dataToSave);
    masterGigRecord.skill_level=payload.skill_level.split(',')
    masterGigRecord.gig_booking_options=payload.gig_booking_options.split(',')
    masterGigRecord.gig_id = masterGigRecord._id
    let savedData=null


    async.series([
        function(cb){
            if(payload.is_product_based==true){
                const newArray=[]
                newArray.push("CAT")
                newArray.push("SUBCAT"),
                    newArray.push("PARAM"),
                    newArray.push("SP")
                newArray.push("DET/PROD")
                console.log("split", newArray)
                masterGigRecord.flow=newArray
                cb()
            }
            else{
                const array=[]
                array.push("CAT")
                array.push("SUBCAT")
                array.push("PARAM")
                array.push("SP")
                cb()
            }

        },
        function(cb){
            const criteria={
                service_id:payload.service_id
            }
            const options={
                lean:true
            }
            masterServiceSchema.MasterService.find(criteria,{},options,function(err,data){
                if(err){
                    cb(err)
                }
                else{
                    console.log(data)
                    if(data &&data.length==0){
                        responseFormatter.formatServiceResponse({}, callback ,'Service not found ','error',400);
                    }
                    else{
                        cb(null)
                    }
                }
            })
        },
        function(cb){
            let x={}
            if (payload.hasOwnProperty("gig_image") && payload.gig_image) {
                 x = payload.gig_image.filename;
                let tempPath = payload.gig_image.path;
                if(typeof payload.gig_image !== 'undefined' && payload.gig_image.length){
                    x = payload.gig_image[1].filename;
                    tempPath = payload.gig_image[1].path;
                }
                let extension = x.split('.').pop();
                let fileName=masterGigRecord._id+"."+extension
                console.log("tempPath",fileName)
                console.log("tempPath",fileName)

                commonFunction.uploadFile(tempPath, fileName, "aLarge", function (err) {

                    if (err) {
                        cb(err);
                    }
                    else {

                        //let x = fileName;
                        //
                        //let fileNameFirst = x.substr(0, x.lastIndexOf('.'));
                        //let extension = x.split('.').pop();

                        masterGigRecord.gig_image = {
                            original: AWS.s3URL + AWS.folder.aLarge + "/" + fileName,
                            thumbnail: AWS.s3URL + AWS.folder.aLarge + "/" + fileName + "_thumb." + extension
                        };

                        console.log("file upload success");
                        console.log("teamPhoto", masterGigRecord.gig_image);
                        cb(null)

                    }
                });
            }
            else {
                cb(null);
            }
        },
        function(cb){
            masterGigRecord.save(function(err,gigRecord){
                if (err){
                    responseFormatter.formatServiceResponse(err, cb);
                }
                else {
                    savedData=gigRecord
                    console.log("in success :masterServiceRecord created successfully",savedData);
                    responseFormatter.formatServiceResponse(gigRecord, cb, 'Gig created successfully','success',200);
                }
            });
        }
    ],function(err,data){
        if(err){
            callback(err)
        }
        else{
            callback(null,data)
        }
    })
}
module.exports.addMapperModel=function(payload,callback){
   // let gigID=payload.gigID.split(',')
   //let locationID=payload.locationID.split(',')
    let gigData=null
    let newData=[]
    let newDataIDs=[]
    let firstData=null
    let parallelF=[]
    let finalDataPushed=[]
    console.log("payload service_id",payload.service_id)
    let mappings=payload.mapper
    //gigID.forEach(function(result){
    //    console.log("result+++++++",result)
    //    parallelF.push(function(internalcb){
    //
    //    })
    //})
    //console.log("paralleF", parallelF);
    //
    //async.parallel(parallelF, function (error, data) {
    //    console.log('error data : ------',error , data);
    //    if (error) {
    //        console.log('error : ',error);
    //        return callback();
    //    }
    //    else {
    //
    //        console.log("in after doing multiple gigs and multiple location in parallel final",data)
    //        callback(null,data);
    //    }
    //});
    //async.series([
    //    function(cb){
    //        gigServiceSchema.Gigs.findOne({gig_id:payload.gigID},{service_id:1,pricing:1,revenue_model:1},{lean:true},function(err,data){
    //            if(err){
    //                cb(err)
    //            }
    //            else{
    //                console.log("gigData",data)
    //                gigData=data
    //                cb(null)
    //            }
    //        })
    //    },
    //
    //    function(cb){
    //        const gigremove= mongoose.Types.ObjectId(payload.gigID);
    //        mapperSchema.Mapper.remove({gig:gigremove},function(err,data){
    //            if(err){
    //                cb(err)
    //            }
    //            else{
    //                console.log("remove done",data)
    //                cb(null)
    //            }
    //        })
    //    },
    //    function(cb){
    //        console.log("gigData service",gigData.service_id)
    //        function qFunc(Id, cbb) {
    //            let id = mongoose.Types.ObjectId(Id);
    //            let gig= mongoose.Types.ObjectId(payload.gigID);
    //            console.log("payload.gig--------------------",gig)
    //            mapperSchema.Mapper.findOne({gig:gig,location:id},{},{lean:true},function(err,data){
    //                if(err){
    //                    cbb(err)
    //                }
    //                else{
    //                    if(!data){
    //                        codeSchema.CodeSchema.findOne({_id:Id},{place:1},{},function(err,data){
    //                            if(err){
    //                                cbb(err)
    //                            }
    //                            else{
    //                                let dataToSave={
    //                                    service:gigData.service_id,
    //                                    gig:gig,
    //                                    location_name:data.place,
    //                                    location:id,
    //                                    pricing:gigData.pricing,
    //                                    revenue_model:gigData.revenue_model
    //                                }
    //                                const mapper= mapperSchema.Mapper(dataToSave)
    //                                mapper.save(dataToSave,function(err,data){
    //                                    if(err){
    //                                        cbb(err)
    //                                    }
    //                                    else{
    //                                        console.log("data____++++++++",data)
    //                                        console.log("payload.gig--------------------",data.gig)
    //                                        newData.push(data);
    //                                        let id = mongoose.Types.ObjectId(data._id);
    //                                        newDataIDs.push(id)
    //                                        cbb(null, data)
    //                                    }
    //                                })
    //                            }
    //                        })
    //                    }
    //                    else{
    //                        console.log("data_    hope it never goes here___",data)
    //                        let ID = mongoose.Types.ObjectId(data._id);
    //                        newDataIDs.push(ID)
    //                        cbb(null, data)
    //                    }
    //                }
    //            })
    //
    //        }
    //
    //        var queries = [];
    //        for (var i = 0; i < locationID.length; i++) {
    //            var Id = locationID[i];
    //            queries.push(qFunc.bind(null, Id));
    //        }
    //        async.parallel(queries, function (err, docs) {
    //            if (err) {
    //                cb(err)
    //            }
    //            else{
    //                console.log("docs_____",docs)
    //                console.log("new Data IDS",newDataIDs)
    //                firstData = docs;
    //                cb(null)
    //            }
    //
    //        })
    //    },
    //
    //    function(cb){
    //        gigServiceSchema.Gigs.findOneAndUpdate({gig_id:payload.gigID},{location:newDataIDs},{lean:true,new:true},function(err,data){
    //            if(err){
    //                cb(err)
    //            }
    //            else{
    //                console.log("gig Data After Saving",data)
    //                cb(null)
    //            }
    //        })
    //    }
    //],function(err,data){
    //    if(err){
    //        console.log("err in async series",err)
    //        callback(err)
    //        //internalcb(err)
    //    }
    //    else{
    //        console.log("data of async series",data)
    //        console.log("finalData_________",firstData)
    //        callback(null,firstData)
    //        //finalDataPushed.push(firstData)
    //        //internalcb(null,finalDataPushed)
    //    }
    //})
async.series([
    function(cb){
    const service= mongoose.Types.ObjectId(payload.service_id);
    mapperSchema.Mapper.remove({service:service},function(err,data){
        if(err){
            cb(err)
        }
        else{
            console.log("remove done+++++++",data)
            cb(null)
        }
    })
},
    function(cb){
        mappings.forEach(function(result){
            parallelF.push(function(cbb){
                async.waterfall([
                    function(cb){
                        gigServiceSchema.Gigs.findOne({gig_id:result.gig_id},{service_id:1,pricing:1,revenue_model:1,service_name:1,gig_name:1},{lean:true},function(err,data){
                            if(err){
                                cb(err)
                            }
                            else{
                                console.log("In gigServiceSchema gigData++++++++",data)
                                cb(null,data)
                            }
                        })
                    },
                    function(data,cb){
                        console.log("waterfall data",data)
                        console.log("payload service_id in waterfall",payload.service_id)
                        let gig=mongoose.Types.ObjectId(result.gig_id);
                        const dataToSave={
                            service:payload.service_id,
                            gig:gig,
                            service_name:data.service_name,
                            gig_name:data.gig_name,
                            location_name:result.location_name,
                            location:result.location_id,
                            pricing:data.pricing,
                            revenue_model:data.revenue_model
                        }
                        console.log("dataToSave in mapper save function",dataToSave)
                        const mapper= mapperSchema.Mapper(dataToSave)
                        mapper.save(function(err,savedData){
                            if(err){
                                cb(err)
                            }
                            else{
                                cb(null,savedData)
                            }
                        })

                    }
                ],function(err,data){
                    console.log("sbse final",err,data);
                    if(err){
                        console.log("err+++++++",err)
                        cbb(err)
                    }
                    else{
                        console.log("data+++++++",data)
                        //newData.push(data)
                        cbb(null,data)
                    }
                })
            })
        })
        console.log("paralleF", parallelF);

        async.parallel(parallelF, function (error, data) {

            if (error) {

                return cb(error);
            }
            else {
                finalDataPushed=data
                console.log("__________",data)
                cb(null,data)
            }
        });
    }
],function(err,data){
    if(err){
        callback(err)
    }
    else{
        data=finalDataPushed
        callback(null,data)
    }
})


}
module.exports.getAllGigsModel = function(callback){
    //gigServiceSchema.Gigs.find({},{},{sort:{gig_name:1}}, function (err, data) {
    //    if (err){
    //        logger.error("Find failed", err);
    //        responseFormatter.formatServiceResponse(err, callback);
    //    }
    //    else {
    //        console.log(data)
    //        responseFormatter.formatServiceResponse(data, callback ,'','success',200);
    //    }
    //});
    gigServiceSchema.Gigs.aggregate([
        {"$match":{
            is_active:true
        }},
        {
            "$project": {
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
            gig_booking_options:1,
            tool_required:1,
            additional_comments:1,
            set_unit:1,
            is_active:1,
            addSupplies:1,
            gig_specific_param:1,
            booking_location:1,
            max_fixed_price:1,
            max_hourly_price:1,
            number_of_hours:1,
            is_gigger_required:1,
            no_of_giggers:1,
            "insensitive": { "$toLower": "$gig_name" }
        }
        },
        { "$sort": { "insensitive": 1 } }
    ]).exec(function(err,data){
        if(err){
            callback(err)
        }
        else{
            console.log("in getAllGigsModel aggregation>>>>>",data)
            callback(data)
        }
    })

};
module.exports.getGigsMapping = function(callback){
    let finalData=null
    let gigData=null
    let locationData=[]
    let serviceArray=null
let parallelF=[]
    let gigDataArray=[]
    //gigServiceSchema.Gigs.find({}).populate({path:'location'}).exec(function(err,data){
    //    if(err){
    //        callback(err)
    //    }
    //    else{
    //        finalData=data
    //               console.log("finalData",finalData)
    //               callback(null,finalData)
    //    }
    //})

    //Second Change
  /*  async.series([
        function(cb){
            mapperSchema.Mapper.find().distinct('service',function(err,data){
                if(err){
                    cb(err)
                }
                else{
                    console.log("service id distinct data",data)
                    serviceArray=data
                    cb(null)
                }
            })
        },
        function(cb){
            serviceArray.forEach(function(serviceResult){
                parallelF.push(function(cbb){
                    async.waterfall([
                        function(cb1){
                            mapperSchema.Mapper.distinct('gig',{service:serviceResult},function(err,gig){
                                if(err){
                                    cb1(err)
                                }
                                else{
                                    let parallel=[]
                                    gig.forEach(function(gigResult){
                                        parallel.push(function(cbb1){
                                            gigServiceSchema.Gigs.findOne({gig_id:gigResult},{gig_name:1,service_name:1,gig_id:1,service_id:1,set_unit:1},{lean:true},function(err,data){
                                                if(err){
                                                    cbb1(err)
                                                }
                                                else{
                                                    cbb1(null,data)
                                                }
                                            })
                                        })
                                    })
                                    async.parallel(parallel, function (error, data) {

                                        if (error) {

                                            return cb1(error);
                                        }
                                        else {
                                            console.log("__________",data)
                                            gigData=data
                                            cb1(null,gigData)
                                        }
                                    });
                                }
                            })

                        },
                        function(gigData,cb1){
                            mapperSchema.Mapper.distinct('location',{service:serviceResult},function(err,location){
                                if(err){
                                    cb1(err)
                                }
                                else{
                                    console.log("gigData+++++++++******",gigData)
                                    let parallel2=[]
                                    location.forEach(function(result){
                                        parallel2.push(function(cbb1){
                                            const serviceObjID=mongoose.Types.ObjectId(serviceResult)
                                            //const gigObjID=mongoose.Types.ObjectId(gigResult)
                                            //{location_name:1,location:1,pricing:1,revenue_model:1,gig:1}
                                            //,{lean:true},
                                            mapperSchema.Mapper.find({location:result,service:serviceObjID}).populate('gig').exec(function(err,data){
                                                if(err){
                                                    cbb1(err)
                                                }
                                                else{
                                                    console.log("******",data)
                                                    cbb1(null,data)
                                                }
                                            })
                                        })
                                    })
                                    async.parallel(parallel2, function (error, data) {

                                        if (error) {

                                            return cb1(error);
                                        }
                                        else {
                                            console.log("__________",data)
                                            const serviceOne={}
                                            serviceOne.service_id=gigData[0].service_id,
                                                serviceOne.service_name=gigData[0].service_name
                                                serviceOne.location=data,
                                                serviceOne.gig=gigData

                                            cb1(null,serviceOne)
                                        }
                                    });
                                }
                            })

                        },
                        //function(gig,cb1){
                        //    console.log("waterfall data",gig,result)
                        //    mapperSchema.Mapper.distinct('location',function(err,location){
                        //        if(err){
                        //            cb1(err)
                        //        }
                        //        else{
                        //            console.log("location",location)
                        //            location.forEach(function(result){
                        //                mapperSchema.Mapper.find({location:result},{location:1,pricing:1,revenue_model:1,location_name:1},{lean:true},function(err,data){
                        //                    if(err){
                        //                        cb1(err)
                        //                    }
                        //                    else{
                        //                        console.log("location")
                        //                        locationData.push(location)
                        //                    }
                        //                })
                        //            })
                        //            const locationGig={}
                        //            locationGig.service_id=result
                        //            //locationGig.service_name=gig[0].service_name
                        //            locationGig.location=locationData
                        //            locationGig.gig=gig
                        //            cb1(null,locationGig)
                        //        }
                        //    })
                        //}
                    ],function(err,data){
                        console.log("sbse final",err,data);
                        if(err){
                            console.log("err+++++++",err)
                            cbb(err)
                        }
                        else{
                            console.log("data+++++++",data)
                            //newData.push(data)
                            cbb(null,data)
                        }
                    })
                })
            })
            async.parallel(parallelF, function (error, data) {

                if (error) {

                    return cb(error);
                }
                else {
                    console.log("__________",data)
                    finalData=data
                    cb(null,finalData)

                   // cb(null,locationGig)
                }
            });
        }
    ],function(err,data){
        if(err){
            callback(err)
        }
        else{
            data=finalData
            callback(null,data)
        }
    })*/
    mapperSchema.Mapper.find().distinct('gig',function(err,gig){
                if(err){
                    callback(err)
                }
                else{
                    console.log("gig distinct data",gig)
                    if(gig &&gig.length==0){
                        callback(null)
                    }
                    else{
                        gig.forEach(function(gig_id){
                            parallelF.push(function(cb1){
                                async.waterfall([
                                    function(cbb){
                                        gigServiceSchema.Gigs.findOne({gig_id:gig_id},{gig_name:1,service_name:1,gig_id:1,service_id:1,set_unit:1,is_product_based:1,max_fixed_price:1,max_hourly_price:1,number_of_hours:1},{lean:true},function(err,gigData){
                                            if(err){
                                                cbb(err)
                                            }
                                            else{
                                                if(gigData){
                                                    const id =mongoose.Types.ObjectId(gigData.gig_id)
                                                    mapperSchema.Mapper.find({gig:id},{location:1,location_name:1,pricing:1,revenue_model:1},{lean:true},function(err,location){
                                                        if(err){
                                                            cbb(err)
                                                        }
                                                        else{
                                                            console.log("async waterfall location",location)
                                                            gigData.location=location
                                                            cbb(null,gigData)
                                                        }
                                                    })
                                                }
                                                else{
                                                    cbb({"error" : "Gig Not Found but its mapping is there. Please delete gig mapping from gigLocationMapping , gig_id : ",gig_id})
                                                }
                                            }
                                        })
                                    },
                                    //function(gigData,cbb){
                                    //    console.log("async waterfall++++++",gigData)
                                    //    const id =mongoose.Types.ObjectId(gig_id)
                                    //    mapperSchema.Mapper.find({gig:id},{location:1,location_name:1,pricing:1,revenue_model:1},{lean:true},function(err,location){
                                    //        if(err){
                                    //            cbb(err)
                                    //        }
                                    //        else{
                                    //            console.log("async waterfall location",location)
                                    //            if(!gigData)
                                    //            {
                                    //                console.log("Gig Not Found but its mapping is there. Please delete gig mapping from gigLocationMapping , gig_id : ",gig_id);
                                    //
                                    //                cbb(null,{"error" : "Gig Not Found but its mapping is there. Please delete gig mapping from gigLocationMapping , gig_id : ",gig_id});
                                    //            }
                                    //            else{
                                    //                gigData.location=location
                                    //                cbb(null,gigData)
                                    //            }
                                    //        }
                                    //    })
                                    //}
                                ],function(err,data){
                                    if(err){
                                        cb1(err)
                                    }
                                    else{
                                        console.log(" data",data)
                                        cb1(null,data)
                                    }
                                })
                            })
                        })
                        async.parallel(parallelF,function(err,data){
                            if(err){
                                callback(err)
                            }
                            else{
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
                }
            })
};
module.exports.getGigMappingByService=function(payload,callback){
    let service_id=mongoose.Types.ObjectId(payload.service_id)
 async.waterfall([
     function(cb){
         mapperSchema.Mapper.distinct('gig',{service:service_id},function(err,gig){
             if(err){
                 cb(err)
             }
             else{
                 let parallel=[]
                 gig.forEach(function(gig_id){
                     parallel.push(function(cbb1){
                         gigServiceSchema.Gigs.findOne({gig_id:gig_id},{gig_name:1,service_name:1,gig_id:1,service_id:1,set_unit:1},{lean:true},function(err,data){
                             if(err){
                                 cbb1(err)
                             }
                             else{
                            
                                 cbb1(null,data)
                             }
                         })
                     })
                 })
                 async.parallel(parallel, function (error, gigData) {

                     if (error) {

                         return cb(error);
                     }
                     else {
                         console.log("__________",gigData)

                         cb(null,gigData)
                     }
                 });
             }
         })
     },
     function(gigData,cb){
         mapperSchema.Mapper.distinct('location',{service:service_id},function(err,location){
             if(err){
                 cb(err)
             }
             else{
                 console.log("gigData+++++++++******",gigData)
                 let parallel2=[]
                 location.forEach(function(result){
                     parallel2.push(function(cbb){
                         //const gigObjID=mongoose.Types.ObjectId(gigResult)
                         //{location_name:1,location:1,pricing:1,revenue_model:1,gig:1}
                         //,{lean:true},
                         mapperSchema.Mapper.findOne({location:result,service:service_id},{location:1,location_name:1,gig:1,revenue_model:1,pricing:1}).populate('gig',{set_unit:1}).exec(function(err,data){
                             if(err){
                                 cbb(err)
                             }
                             else{
                                 console.log("******",data)
                                 cbb(null,data)
                             }
                         })
                     })
                 })
                 async.parallel(parallel2, function (error, data) {

                     if (error) {

                         return cb(error);
                     }
                     else {
                         console.log("__________",data)
                         if(gigData && gigData.length==0){
                             cb(null,gigData)
                         }
                         else{
                             const serviceOne={}
                             serviceOne.service_id=gigData[0].service_id,
                                 serviceOne.service_name=gigData[0].service_name
                             serviceOne.location=data,
                                 serviceOne.gig=gigData

                             cb(null,serviceOne)

                         }


                     }
                 });
             }
         })
     }
 ],function(err,data){
     if(err){
         callback(err)
     }
     else{

     if(data &&data.length==0){
  responseFormatter.formatServiceResponse({}, callback ,config.constants.messages.error.locationNOtFound,'error',400);
   
                    }
                    else{
                        callback(null,data)
                    }
         
     }
 })

}
module.exports.getGigLocationModel = function(payload,callback){
    let finalData=null
    let locationData=null
    async.series([
        function(cb){
            const id = mongoose.Types.ObjectId(payload.gigID);
            // mapperSchema.Mapper.find({gig:id},{location:1,location_name:1,pricing:1,revenue_model:1},{lean:true},function(err,data){
            //  if(err){
            //      cb(err)
            //  }
            //     else{
            //      console.log("locationData",data)
            //      locationData=data
            //      cb(null)
            //  }
            //})


            mapperSchema.Mapper.aggregate([
                {"$match":{
            gig:id
        }},
        { "$project": {
            
            location:1,
            location_name:1,
            pricing:1,
            revenue_model:1,
            "insensitive": { "$toLower": "$location_name" }
        }},
        { "$sort": { "insensitive": 1 } }
    ]).exec(function(err,data){
        if(err){
            cb(err)
        }
        else{
            console.log("locationData",data)
            locationData=data
            cb(null)
        }
    })

    },
        function(cb){
            gigServiceSchema.Gigs.findOne({gig_id:payload.gigID},{},{lean:true},function(err,data){
                if(err){
                    cb(err)
                }
                else{
                    finalData=data
                    finalData.location_info=locationData
                    console.log("finalData",finalData)
                    cb(null)
                }
            })
        }
    ],function(err,data){
        if(err){
            callback(err)
        }
        else{
            data=finalData,
                callback(null,data)
        }
    })

};

module.exports.addGigSpecificParam = function(payload , callback){

    gigServiceSchema.Gigs.update({ gig_id: payload.gig_id }, payload ,function (err, result) {
        console.log('addGigSpecificParam result :: ',result);
        if(err){
            logger.error("Find failed", err);
            responseFormatter.formatServiceResponse(err, callback);
        }else{
            if(result.n != 0){
                responseFormatter.formatServiceResponse({}, callback ,'Gig Specific Parameter updated successfully','success',200);
            }else{
                responseFormatter.formatServiceResponse({}, callback ,'gig not found','error',404);
            }

        }
    });


};
module.exports.getGigSpecificParam = function(payload , callback){

    gigServiceSchema.Gigs.find({ gig_id: payload.gig_id }, {gig_specific_param:1,is_product_based :1} ,function (err, result) {
        console.log('addGigSpecificParam result :: ',result);
        if(err){
            logger.error("Find failed", err);
            responseFormatter.formatServiceResponse(err, callback);
        }else{
            responseFormatter.formatServiceResponse(result, callback ,'Get Success','success',200);
        }
    });


};
module.exports.updateLocationModel=function(payload,callback){
    mapperSchema.Mapper.findOneAndUpdate({_id:payload.locationID},{pricing:payload.pricing,revenue_model:payload.revenue_model},{lean:true,new:true},function(err,data){
        if(err){
            callback(err)
        }
        else{
            callback(null,data)
        }
    })
//    let prefinal=[]
//async.series([
//    function(cb){
//        let parallelF=[]
//        payload.update.forEach(function (result) {
//            parallelF.push(function (cbb) {
//                result.locationID=
//
//
//            })
//        });
//        console.log("paralleF", parallelF);
//
//        async.parallel(parallelF, function (error, data) {
//
//            if (error) {
//                return cb(error);
//            }
//            else {
//                console.log("data",data)
//                console.log("deviceTeamData",prefinal)
//                cb()
//            }
//        });
//}
//],function(err,data){
//    if(err){
//        callback(err)
//    }
//    else{
//        data=prefinal
//        callback(null,data)
//    }
//})
}
module.exports.getAllCategoriesByGigId = function(gig_id , callback){
    console.log('gig_id : ',gig_id);
    const id = mongoose.Types.ObjectId(gig_id);
    gigServiceSchema.Gigs.find({_id: id }, {gig_categories:1} ,function (err, result) {
        console.log('getAllCategoriesByGigId result :: ',result);
        if(err){
            logger.error("Find failed", err);
            responseFormatter.formatServiceResponse(err, callback);
        }else{
            responseFormatter.formatServiceResponse(result, callback ,'Get All Categories By GigId Success','success',200);
        }
    });


};