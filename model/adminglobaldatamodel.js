/**
 * Created by cl-macmini-149 on 03/05/17.
 */

'use strict';
const responseFormatter = require('Utils/responseformatter.js');
var config=require('../config');
const adminGlobalDataSchema = require('schema/mongo/adminglobaldata');
const  log = require('Utils/logger.js');
const logger = log.getLogger();
const mongoose = require('mongoose');

module.exports = {};

module.exports.addGlobalData = function(payload , callback){


    let adminGlobalData = new adminGlobalDataSchema.AdminGlobalData(payload);
    adminGlobalData.eta.priority = 1;
    adminGlobalData.price.priority = 2;
    adminGlobalData.skill_level.priority = 3;
    adminGlobalData.rating.priority = 4;
    adminGlobalData.job_acceptance.priority = 5;
        adminGlobalData.save(function(err,adminGlobalData){
            if (err){
                console.log('error in addGlobalData :: ',err);
                responseFormatter.formatServiceResponse(err, callback);
            }
            else {
                console.log("in success :adminGlobalData created successfully");
                responseFormatter.formatServiceResponse(adminGlobalData, callback, 'adminGlobalData Saved successfully','success',200);
            }
        });
};

module.exports.editGlobalData = function(payload , callback){
    const id = mongoose.Types.ObjectId(payload.doc_id);
    adminGlobalDataSchema.AdminGlobalData.findOneAndUpdate({_id : id},payload,{new:true},function(err,data){
        if(err){
            cb(err)
        }
        else{
            console.log("adminGlobalData updated successfully",data);
            responseFormatter.formatServiceResponse(data, callback, 'adminGlobalData updated successfully','success',200);
        }
    });

};

module.exports.getGlobalData=function(callback){
    adminGlobalDataSchema.AdminGlobalData.findOne({},{},{lean:true},function(err,data){
        if(err){
            console.log('error in addGlobalData :: ',err);
            responseFormatter.formatServiceResponse(err, callback);
        }
        else{
            console.log("in success :adminGlobalData created successfully");
            responseFormatter.formatServiceResponse(data, callback, 'adminGlobalData fetched successfully','success',200);
        }
    })
}
